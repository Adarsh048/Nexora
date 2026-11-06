import ProcessedEmail from '../models/ProcessedEmail.js';
import Application from '../models/Application.js';
import ApplicationEvent from '../models/ApplicationEvent.js';
import Achievement from '../models/Achievement.js';
import Notification from '../models/Notification.js';
import { classifyEmail, extractCompanyInfo, matchApplication } from '../utils/emailClassifier.js';

export async function getInboxEmails(req, res) {
  try {
    const { category, reviewStatus = 'pending', search, limit = 50, page = 1 } = req.query;

    const query = { userId: req.user._id };

    if (reviewStatus && reviewStatus !== 'all') {
      query.reviewStatus = reviewStatus;
    }

    if (category && category !== 'All') {
      if (category === 'Unmatched') {
        query.matchedApplicationId = null;
      } else {
        query.detectedCategory = category;
      }
    }

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { senderName: { $regex: search, $options: 'i' } },
        { senderEmail: { $regex: search, $options: 'i' } },
        { detectedCompany: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [emails, total, pendingCount] = await Promise.all([
      ProcessedEmail.find(query)
        .sort('-receivedAt')
        .skip(skip)
        .limit(Number(limit))
        .populate('matchedApplicationId', 'companyName jobTitle status companyLogo')
        .lean(),
      ProcessedEmail.countDocuments(query),
      ProcessedEmail.countDocuments({ userId: req.user._id, reviewStatus: 'pending' }),
    ]);

    res.status(200).json({
      success: true,
      data: emails,
      pendingCount,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function approveSuggestion(req, res) {
  try {
    const { emailId } = req.params;
    const { targetApplicationId, newStatus, notes } = req.body;

    const email = await ProcessedEmail.findOne({ _id: emailId, userId: req.user._id });
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email record not found' });
    }

    const appId = targetApplicationId || email.matchedApplicationId;
    if (!appId) {
      return res.status(400).json({ success: false, message: 'Please select an application to apply this update to.' });
    }

    const application = await Application.findOne({ _id: appId, userId: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Target application not found' });
    }

    const previousStatus = application.status;
    const updatedStatus = newStatus || email.suggestedStatus || previousStatus;

    // Update application status
    if (updatedStatus && updatedStatus !== previousStatus) {
      application.status = updatedStatus;
      await application.save();
    }

    // Determine timeline event type
    let eventType = 'Status Changed';
    if (email.detectedCategory === 'Interview') eventType = 'Interview Scheduled';
    else if (email.detectedCategory === 'Assessment') eventType = 'Assessment Invitation';
    else if (email.detectedCategory === 'Offer') eventType = 'Offer Received';
    else if (email.detectedCategory === 'Rejection') eventType = 'Rejection Received';
    else if (email.detectedCategory === 'Confirmation') eventType = 'Confirmation Received';

    // Record verified evidence in application timeline
    const timelineEvent = await ApplicationEvent.create({
      userId: req.user._id,
      applicationId: application._id,
      eventType,
      title: `${email.detectedCategory} update verified from email`,
      eventDate: email.receivedAt || new Date(),
      source: 'gmail',
      previousStatus,
      newStatus: updatedStatus,
      notes: notes || `Email subject: "${email.subject}" from ${email.senderEmail}`,
      emailReferenceId: email._id,
    });

    // Mark email as approved
    email.reviewStatus = 'approved';
    email.appliedToTimeline = true;
    email.matchedApplicationId = application._id;
    email.actionTakenAt = new Date();
    await email.save();

    // Check achievements
    if (updatedStatus === 'Interview') {
      await Achievement.updateOne(
        { userId: req.user._id, badgeKey: 'interview_ready' },
        { unlocked: true, unlockedAt: new Date(), progress: 1 }
      );
    } else if (updatedStatus === 'Offer') {
      await Achievement.updateOne(
        { userId: req.user._id, badgeKey: 'offer_unlocked' },
        { unlocked: true, unlockedAt: new Date(), progress: 1 }
      );
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${updatedStatus} and recorded to timeline with email evidence.`,
      data: {
        application,
        timelineEvent,
        email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function dismissSuggestion(req, res) {
  try {
    const { emailId } = req.params;

    const email = await ProcessedEmail.findOne({ _id: emailId, userId: req.user._id });
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email record not found' });
    }

    email.reviewStatus = 'dismissed';
    email.actionTakenAt = new Date();
    await email.save();

    res.status(200).json({
      success: true,
      message: 'Suggestion dismissed.',
      data: email,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function manualLinkApplication(req, res) {
  try {
    const { emailId } = req.params;
    const { applicationId } = req.body;

    const [email, application] = await Promise.all([
      ProcessedEmail.findOne({ _id: emailId, userId: req.user._id }),
      Application.findOne({ _id: applicationId, userId: req.user._id }),
    ]);

    if (!email || !application) {
      return res.status(404).json({ success: false, message: 'Email or Application not found' });
    }

    email.matchedApplicationId = application._id;
    email.matchConfidence = 100;
    await email.save();

    res.status(200).json({
      success: true,
      data: email,
      message: `Linked email to ${application.companyName} - ${application.jobTitle}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function simulateEmail(req, res) {
  try {
    const {
      type = 'interview',
      companyName,
      jobTitle,
      customSubject,
      customSnippet,
      senderEmail,
      senderName,
    } = req.body;

    const applications = await Application.find({ userId: req.user._id });

    // Pick target company/role if not specified
    let targetCompany = companyName;
    let targetRole = jobTitle;

    if (!targetCompany && applications.length > 0) {
      targetCompany = applications[0].companyName;
      targetRole = applications[0].jobTitle;
    } else if (!targetCompany) {
      targetCompany = 'Google';
      targetRole = 'Software Engineer';
    }

    const cleanDomain = targetCompany.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company';
    let subject = customSubject;
    let snippet = customSnippet;
    let fromEmail = senderEmail || `recruiting@${cleanDomain}.com`;
    let fromName = senderName || `${targetCompany} Talent Acquisition`;

    if (!subject || !snippet) {
      switch (type.toLowerCase()) {
        case 'offer':
          subject = subject || `Offer of employment: ${targetRole || 'Software Engineer'} at ${targetCompany}`;
          snippet = snippet || `We are delighted to offer you the position of ${targetRole || 'Software Engineer'} at ${targetCompany}. Please find your formal job offer letter and compensation package details enclosed.`;
          break;
        case 'assessment':
          subject = subject || `Online assessment invitation for ${targetRole || 'Software Engineer'} at ${targetCompany}`;
          snippet = snippet || `Thank you for your interest in ${targetCompany}. Please complete our online coding assessment on HackerRank within the next 48 hours.`;
          break;
        case 'rejection':
          subject = subject || `Update regarding your application to ${targetCompany}`;
          snippet = snippet || `Thank you for taking the time to speak with us. Unfortunately, at this time we have decided to move forward with other candidates whose experience more closely aligns with our current needs.`;
          break;
        case 'confirmation':
          subject = subject || `Thank you for applying to ${targetCompany}`;
          snippet = snippet || `We have successfully received your application for the ${targetRole || 'Software Engineer'} role. Our hiring team will review your qualifications shortly.`;
          break;
        case 'interview':
        default:
          subject = subject || `Invitation to interview: ${targetRole || 'Software Engineer'} with ${targetCompany}`;
          snippet = snippet || `Hello, We were impressed with your application and would like to invite you to interview with our engineering team for the ${targetRole || 'Software Engineer'} position. Please click below to schedule your interview.`;
          break;
      }
    }

    // Run real classification and entity extraction
    const classification = classifyEmail({ subject, sender: fromEmail, snippet });
    const entity = extractCompanyInfo(fromEmail, fromName, subject, snippet);
    const { matchedApp, confidence } = matchApplication({
      detectedCompany: entity.detectedCompany || targetCompany,
      detectedJobTitle: entity.detectedJobTitle || targetRole,
      subject,
      snippet,
      senderEmail: fromEmail,
    }, applications);

    const messageId = `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const processed = new ProcessedEmail({
      userId: req.user._id,
      messageId,
      threadId: `th_${messageId}`,
      senderName: fromName,
      senderEmail: fromEmail,
      subject,
      snippet,
      receivedAt: new Date(),
      detectedCategory: classification.category,
      suggestedStatus: classification.suggestedStatus,
      detectedCompany: entity.detectedCompany || targetCompany,
      detectedJobTitle: entity.detectedJobTitle || targetRole,
      matchConfidence: confidence,
      matchedApplicationId: matchedApp ? matchedApp._id : null,
      reviewStatus: 'pending',
    });

    await processed.save();

    await Notification.create({
      userId: req.user._id,
      title: `${classification.category} email detected`,
      message: `New recruitment email from ${entity.detectedCompany || targetCompany}: "${subject}"`,
      type: 'email_detected',
      link: '/inbox',
    });

    const populated = await ProcessedEmail.findById(processed._id).populate('matchedApplicationId', 'companyName jobTitle status companyLogo');

    res.status(201).json({
      success: true,
      data: populated,
      message: `Recruitment email simulated and classified as "${classification.category}" with ${confidence}% match confidence.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function clearInboxEmails(req, res) {
  try {
    await ProcessedEmail.deleteMany({ userId: req.user._id });
    res.status(200).json({ success: true, message: 'All inbox emails cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

