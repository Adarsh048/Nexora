import ProcessedEmail from '../models/ProcessedEmail.js';
import Application from '../models/Application.js';
import ApplicationEvent from '../models/ApplicationEvent.js';
import Achievement from '../models/Achievement.js';

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
        .populate('matchedApplicationId', 'companyName jobTitle status companyLogo'),
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

