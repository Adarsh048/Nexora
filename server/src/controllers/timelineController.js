import ApplicationEvent from '../models/ApplicationEvent.js';
import Application from '../models/Application.js';

export async function getApplicationTimeline(req, res) {
  try {
    const { applicationId } = req.params;

    const events = await ApplicationEvent.find({
      applicationId,
      userId: req.user._id,
    })
      .sort('-eventDate')
      .populate('emailReferenceId', 'subject senderEmail receivedAt detectedCategory snippet');

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function addTimelineEvent(req, res) {
  try {
    const { applicationId } = req.params;
    const { eventType, title, notes, eventDate, newStatus } = req.body;

    const application = await Application.findOne({
      _id: applicationId,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const previousStatus = application.status;
    if (newStatus && newStatus !== previousStatus) {
      application.status = newStatus;
      await application.save();
    }

    const event = await ApplicationEvent.create({
      userId: req.user._id,
      applicationId: application._id,
      eventType: eventType || 'Note Added',
      title: title || `${eventType} - ${application.companyName}`,
      notes: notes || '',
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      source: 'manual',
      previousStatus: newStatus ? previousStatus : null,
      newStatus: newStatus ? newStatus : null,
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getActivityFeed(req, res) {
  try {
    const { eventType, source, companyName, limit = 50, page = 1 } = req.query;

    const query = { userId: req.user._id };

    if (eventType && eventType !== 'All') {
      query.eventType = eventType;
    }

    if (source && source !== 'All') {
      query.source = source;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      ApplicationEvent.find(query)
        .sort('-eventDate')
        .skip(skip)
        .limit(Number(limit))
        .populate('applicationId', 'companyName jobTitle companyLogo status'),
      ApplicationEvent.countDocuments(query),
    ]);

    // Optional filter by companyName post-population or through join
    let filteredEvents = events;
    if (companyName) {
      filteredEvents = events.filter(e => 
        e.applicationId && e.applicationId.companyName.toLowerCase().includes(companyName.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      data: filteredEvents,
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

