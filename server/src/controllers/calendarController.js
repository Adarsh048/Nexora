import CalendarEvent from '../models/CalendarEvent.js';
import Application from '../models/Application.js';

export async function getCalendarEvents(req, res) {
  try {
    const { start, end, eventType } = req.query;

    const query = { userId: req.user._id };

    if (start && end) {
      query.startTime = { $gte: new Date(start), $lte: new Date(end) };
    }

    if (eventType && eventType !== 'All') {
      query.eventType = eventType;
    }

    const events = await CalendarEvent.find(query)
      .sort('startTime')
      .populate('applicationId', 'companyName jobTitle companyLogo status')
      .lean();

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createCalendarEvent(req, res) {
  try {
    const {
      applicationId,
      companyName,
      title,
      eventType = 'Interview',
      startTime,
      endTime,
      location,
      meetingLink,
      notes,
      reminderMinutes,
    } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Title, start time, and end time are required.' });
    }

    let compName = companyName;
    if (applicationId && !compName) {
      const app = await Application.findById(applicationId);
      if (app) compName = app.companyName;
    }

    const event = await CalendarEvent.create({
      userId: req.user._id,
      applicationId: applicationId || null,
      companyName: compName || '',
      title,
      eventType,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location: location || 'Google Meet / Zoom',
      meetingLink: meetingLink || '',
      notes: notes || '',
      reminderMinutes: reminderMinutes || 30,
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateCalendarEvent(req, res) {
  try {
    const event = await CalendarEvent.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    Object.assign(event, req.body);
    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteCalendarEvent(req, res) {
  try {
    const event = await CalendarEvent.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

