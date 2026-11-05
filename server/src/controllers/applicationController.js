import Application from '../models/Application.js';
import ApplicationEvent from '../models/ApplicationEvent.js';
import Company from '../models/Company.js';
import Achievement from '../models/Achievement.js';
import { format } from 'date-fns';

export async function getApplications(req, res) {
  try {
    const { status, search, source, sort = '-appliedDate', page = 1, limit = 50 } = req.query;

    const query = { userId: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (source && source !== 'All') {
      query.source = source;
    }

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
        { jobLocation: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [applications, total] = await Promise.all([
      Application.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Application.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getKanbanBoard(req, res) {
  try {
    const applications = await Application.find({ userId: req.user._id }).sort('kanbanOrder -appliedDate');

    const columns = {
      Saved: [],
      Applied: [],
      Assessment: [],
      Interview: [],
      Offer: [],
      Rejected: [],
      Withdrawn: [],
      'On Hold': [],
    };

    applications.forEach(app => {
      if (columns[app.status]) {
        columns[app.status].push(app);
      } else {
        columns['Applied'].push(app);
      }
    });

    res.status(200).json({
      success: true,
      data: columns,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getApplicationById(req, res) {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const [timeline, company] = await Promise.all([
      ApplicationEvent.find({ applicationId: application._id, userId: req.user._id }).sort('-eventDate'),
      application.companyId ? Company.findById(application.companyId) : null,
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...application.toObject(),
        timeline,
        company,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createApplication(req, res) {
  try {
    const {
      companyName,
      companyLogo,
      jobTitle,
      jobDescription,
      jobLocation,
      employmentType,
      appliedDate,
      source,
      originalUrl,
      portalUrl,
      status = 'Applied',
      recruiterName,
      recruiterEmail,
      salaryRange,
      notes,
      followUpDate,
      assessmentDeadline,
      interviewDate,
      priority,
      tags,
    } = req.body;

    if (!companyName || !jobTitle) {
      return res.status(400).json({ success: false, message: 'Company name and job title are required.' });
    }

    // Check for possible duplicate
    const existing = await Application.findOne({
      userId: req.user._id,
      companyName: { $regex: new RegExp(`^${companyName.trim()}$`, 'i') },
      jobTitle: { $regex: new RegExp(`^${jobTitle.trim()}$`, 'i') },
    });

    let duplicateWarning = null;
    if (existing) {
      duplicateWarning = `Notice: You already have an application for "${jobTitle}" at ${companyName} created on ${format(existing.appliedDate, 'MMM d, yyyy')}.`;
    }

    // Upsert or find Company
    let company = await Company.findOne({
      userId: req.user._id,
      name: { $regex: new RegExp(`^${companyName.trim()}$`, 'i') },
    });

    if (!company) {
      company = await Company.create({
        userId: req.user._id,
        name: companyName.trim(),
        logo: companyLogo || '',
        location: jobLocation || '',
        recruiterContacts: recruiterName ? [{ name: recruiterName, email: recruiterEmail || '', role: 'Recruiter' }] : [],
      });
    }

    const application = await Application.create({
      userId: req.user._id,
      companyId: company._id,
      companyName: companyName.trim(),
      companyLogo: companyLogo || company.logo || '',
      jobTitle: jobTitle.trim(),
      jobDescription,
      jobLocation: jobLocation || 'Remote',
      employmentType: employmentType || 'Full-time',
      appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
      source: source || 'LinkedIn',
      originalUrl,
      portalUrl,
      status,
      recruiterName,
      recruiterEmail,
      salaryRange,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      assessmentDeadline: assessmentDeadline ? new Date(assessmentDeadline) : null,
      interviewDate: interviewDate ? new Date(interviewDate) : null,
      priority: priority || 'Medium',
      tags: tags || [],
    });

    // Record initial timeline event
    await ApplicationEvent.create({
      userId: req.user._id,
      applicationId: application._id,
      eventType: status === 'Saved' ? 'Note Added' : 'Application Submitted',
      title: status === 'Saved' ? 'Saved opportunity to pipeline' : `Applied to ${companyName.trim()} for ${jobTitle.trim()}`,
      eventDate: application.appliedDate,
      source: 'manual',
      newStatus: status,
      notes: notes || 'Application created in Nexora',
    });

    // Update achievement progress
    const appCount = await Application.countDocuments({ userId: req.user._id });
    if (appCount === 1) {
      await Achievement.updateOne(
        { userId: req.user._id, badgeKey: 'first_step' },
        { unlocked: true, unlockedAt: new Date(), progress: 1 }
      );
    }
    if (appCount >= 20) {
      await Achievement.updateOne(
        { userId: req.user._id, badgeKey: 'pipeline_pro' },
        { unlocked: true, unlockedAt: new Date(), progress: 20 }
      );
    }

    res.status(201).json({
      success: true,
      data: application,
      duplicateWarning,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateApplication(req, res) {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const previousStatus = application.status;
    const updates = req.body;

    Object.assign(application, updates);
    await application.save();

    // If status changed via generic update
    if (updates.status && updates.status !== previousStatus) {
      await ApplicationEvent.create({
        userId: req.user._id,
        applicationId: application._id,
        eventType: 'Status Changed',
        title: `Status updated from ${previousStatus} to ${updates.status}`,
        eventDate: new Date(),
        source: 'manual',
        previousStatus,
        newStatus: updates.status,
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const { status, notes, kanbanOrder } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const previousStatus = application.status;
    application.status = status;
    if (kanbanOrder !== undefined) {
      application.kanbanOrder = kanbanOrder;
    }
    await application.save();

    if (previousStatus !== status) {
      let eventType = 'Status Changed';
      if (status === 'Interview') eventType = 'Interview Scheduled';
      else if (status === 'Assessment') eventType = 'Assessment Invitation';
      else if (status === 'Offer') eventType = 'Offer Received';
      else if (status === 'Rejected') eventType = 'Rejection Received';

      await ApplicationEvent.create({
        userId: req.user._id,
        applicationId: application._id,
        eventType,
        title: `${eventType} - ${application.companyName}`,
        eventDate: new Date(),
        source: 'manual',
        previousStatus,
        newStatus: status,
        notes: notes || '',
      });

      // Achievement checks
      if (status === 'Interview') {
        await Achievement.updateOne(
          { userId: req.user._id, badgeKey: 'interview_ready' },
          { unlocked: true, unlockedAt: new Date(), progress: 1 }
        );
      } else if (status === 'Offer') {
        await Achievement.updateOne(
          { userId: req.user._id, badgeKey: 'offer_unlocked' },
          { unlocked: true, unlockedAt: new Date(), progress: 1 }
        );
      }
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteApplication(req, res) {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Cascade delete timeline events
    await ApplicationEvent.deleteMany({
      applicationId: application._id,
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Application and associated timeline events deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

