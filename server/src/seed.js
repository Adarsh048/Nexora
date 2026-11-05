import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { format, subDays, addDays } from 'date-fns';

import User from './models/User.js';
import Company from './models/Company.js';
import Application from './models/Application.js';
import ApplicationEvent from './models/ApplicationEvent.js';
import CalendarEvent from './models/CalendarEvent.js';
import ProcessedEmail from './models/ProcessedEmail.js';
import Achievement from './models/Achievement.js';
import Notification from './models/Notification.js';
import EmailConnection from './models/EmailConnection.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexora';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB');

    // Clean previous seed data for fresh experience
    await Promise.all([
      User.deleteMany({ email: 'adarsh@nexora.dev' }),
    ]);

    // Find or create default user
    const now = new Date();
    const user = await User.create({
      name: 'Adarsh',
      email: 'adarsh@nexora.dev',
      password: 'password123',
      careerGoal: 'Get your next offer',
      targetRole: 'Full Stack Engineer',
      weeklyGoal: 5,
      streak: {
        current: 12,
        best: 14,
        lastActiveDate: now,
        activeDays: [
          format(now, 'yyyy-MM-dd'),
          format(subDays(now, 1), 'yyyy-MM-dd'),
          format(subDays(now, 2), 'yyyy-MM-dd'),
          format(subDays(now, 3), 'yyyy-MM-dd'),
          format(subDays(now, 4), 'yyyy-MM-dd'),
          format(subDays(now, 5), 'yyyy-MM-dd'),
          format(subDays(now, 6), 'yyyy-MM-dd'),
        ],
      },
      onboardingCompleted: true,
    });

    const userId = user._id;

    // Clean existing user records
    await Promise.all([
      Company.deleteMany({ userId }),
      Application.deleteMany({ userId }),
      ApplicationEvent.deleteMany({ userId }),
      CalendarEvent.deleteMany({ userId }),
      ProcessedEmail.deleteMany({ userId }),
      Achievement.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      EmailConnection.deleteMany({ userId }),
    ]);

    console.log('[Seed] Created default user: adarsh@nexora.dev');

    // Create Email Connection (demonstrating connected state with simulated inbox)
    const emailConn = await EmailConnection.create({
      userId,
      emailAddress: 'adarsh.nexora@gmail.com',
      provider: 'gmail',
      connected: true,
      monitoringActive: true,
      lastSyncedAt: subDays(now, 0),
      syncStatus: 'success',
    });

    // Create Companies
    const companySeeds = [
      { name: 'Google', logo: 'https://www.google.com/favicon.ico', industry: 'Technology', location: 'Mountain View, CA / Remote', website: 'https://google.com' },
      { name: 'Visa', logo: 'https://usa.visa.com/favicon.ico', industry: 'FinTech', location: 'Austin, TX / Foster City, CA', website: 'https://visa.com' },
      { name: 'PwC', logo: 'https://www.pwc.com/favicon.ico', industry: 'Consulting', location: 'New York, NY', website: 'https://pwc.com' },
      { name: 'BlackRock', logo: 'https://www.blackrock.com/favicon.ico', industry: 'Investment Banking', location: 'New York, NY / Remote', website: 'https://blackrock.com' },
      { name: 'Deloitte', logo: 'https://www.deloitte.com/favicon.ico', industry: 'Management Consulting', location: 'Chicago, IL', website: 'https://deloitte.com' },
      { name: 'NatWest', logo: 'https://www.natwest.com/favicon.ico', industry: 'Banking', location: 'London / Edinburgh / Remote', website: 'https://natwest.com' },
      { name: 'Atlassian', logo: 'https://www.atlassian.com/favicon.ico', industry: 'Enterprise SaaS', location: 'Remote / San Francisco', website: 'https://atlassian.com' },
      { name: 'Honeywell', logo: 'https://www.honeywell.com/favicon.ico', industry: 'Aerospace & Software', location: 'Charlotte, NC', website: 'https://honeywell.com' },
      { name: 'Stripe', logo: 'https://stripe.com/favicon.ico', industry: 'FinTech Payments', location: 'Remote', website: 'https://stripe.com' },
      { name: 'Datadog', logo: 'https://www.datadoghq.com/favicon.ico', industry: 'Cloud Monitoring', location: 'New York, NY', website: 'https://datadoghq.com' },
    ];

    const companyDocs = {};
    for (const c of companySeeds) {
      const doc = await Company.create({
        userId,
        ...c,
        recruiterContacts: [
          { name: `${c.name} Talent Partner`, email: `careers@${c.name.toLowerCase().replace(/\s+/g, '')}.com`, role: 'Campus / Senior Recruiter' }
        ],
        notes: `Leading firm in ${c.industry}. Excellent engineering culture and growth opportunities.`,
      });
      companyDocs[c.name] = doc;
    }

    // Core Reference Applications (matches the visual reference)
    const appsToSeed = [
      // Saved
      { company: 'Google', title: 'SDE Intern', status: 'Saved', source: 'LinkedIn', location: 'Mountain View, CA', salary: '$55 - $65 / hr', date: subDays(now, 8) },
      { company: 'Atlassian', title: 'Frontend Intern', status: 'Saved', source: 'Greenhouse', location: 'Remote', salary: '$48 - $55 / hr', date: subDays(now, 10) },
      { company: 'Stripe', title: 'Full Stack Engineer', status: 'Saved', source: 'Company Website', location: 'Remote', salary: '$165,000 - $190,000', date: subDays(now, 12) },

      // Applied
      { company: 'Visa', title: 'Software Engineer', status: 'Applied', source: 'Workday', location: 'Foster City, CA', salary: '$140,000 - $160,000', date: subDays(now, 4) },
      { company: 'Deloitte', title: 'Analyst', status: 'Applied', source: 'LinkedIn', location: 'Chicago, IL', salary: '$95,000 - $110,000', date: subDays(now, 2) },
      { company: 'Datadog', title: 'Systems Engineer', status: 'Applied', source: 'Lever', location: 'New York, NY', salary: '$150,000 - $175,000', date: subDays(now, 5) },

      // Assessment
      { company: 'PwC', title: 'Frontend Developer', status: 'Assessment', source: 'LinkedIn', location: 'New York, NY', salary: '$115,000 - $130,000', date: subDays(now, 14), deadline: addDays(now, 3) },
      { company: 'NatWest', title: 'Full Stack Intern', status: 'Assessment', source: 'Company Website', location: 'Remote', salary: '£38,000 - £44,000', date: subDays(now, 11), deadline: addDays(now, 5) },

      // Interview
      { company: 'BlackRock', title: 'Software Engineer', status: 'Interview', source: 'Referral', location: 'New York, NY', salary: '$155,000 - $180,000', date: subDays(now, 18), interviewDate: addDays(now, 2) },
      { company: 'Honeywell', title: 'SDE Intern', status: 'Interview', source: 'LinkedIn', location: 'Charlotte, NC', salary: '$42 - $50 / hr', date: subDays(now, 15), interviewDate: addDays(now, 4) },

      // Offer
      { company: 'Stripe', title: 'Product Engineering Fellow', status: 'Offer', source: 'Referral', location: 'Remote', salary: '$150,000 base + equity', date: subDays(now, 25) },
      { company: 'Google', title: 'Cloud Solutions Associate', status: 'Offer', source: 'Company Website', location: 'Sunnyvale, CA', salary: '$145,000 base + sign-on', date: subDays(now, 28) },
    ];

    // Plus 24 additional realistic historical applications to match Total = 36, Interviews = 7, Offers = 2, Rejected = 12
    const additionalRejected = [
      'Meta', 'Amazon', 'Netflix', 'Apple', 'Microsoft', 'Uber', 'Airbnb', 'Spotify', 'Pinterest', 'Lyft', 'Salesforce', 'Adobe'
    ];

    additionalRejected.forEach((compName, idx) => {
      appsToSeed.push({
        company: compName,
        title: idx % 2 === 0 ? 'Software Engineer' : 'Frontend Developer',
        status: 'Rejected',
        source: idx % 3 === 0 ? 'LinkedIn' : (idx % 3 === 1 ? 'Workday' : 'Company Website'),
        location: 'Remote',
        salary: '$130,000 - $160,000',
        date: subDays(now, 20 + idx * 2),
      });
    });

    const additionalInterviews = [
      { company: 'Datadog', title: 'Frontend Engineer', status: 'Interview', source: 'Lever', location: 'Remote', date: subDays(now, 19) },
      { company: 'Google', title: 'Frontend Developer', status: 'Interview', source: 'LinkedIn', location: 'New York', date: subDays(now, 22) },
      { company: 'Visa', title: 'Cloud Platform Engineer', status: 'Interview', source: 'Company Website', location: 'Austin, TX', date: subDays(now, 24) },
      { company: 'Deloitte', title: 'Technology Consultant', status: 'Interview', source: 'Naukri', location: 'Dallas, TX', date: subDays(now, 26) },
      { company: 'PwC', title: 'Full Stack Associate', status: 'Interview', source: 'LinkedIn', location: 'Remote', date: subDays(now, 30) },
    ];
    appsToSeed.push(...additionalInterviews);

    // Remaining to reach exact 36
    const additionalApplied = [
      { company: 'Atlassian', title: 'Backend Developer', status: 'Applied', source: 'Greenhouse', location: 'Remote', date: subDays(now, 3) },
      { company: 'NatWest', title: 'Junior Software Engineer', status: 'Applied', source: 'LinkedIn', location: 'London', date: subDays(now, 1) },
      { company: 'Honeywell', title: 'Embedded Software Engineer', status: 'Applied', source: 'Company Website', location: 'Atlanta, GA', date: subDays(now, 2) },
      { company: 'BlackRock', title: 'Quantitative Developer', status: 'Applied', source: 'LinkedIn', location: 'San Francisco, CA', date: subDays(now, 4) },
      { company: 'Visa', title: 'Mobile Developer (iOS/Android)', status: 'Applied', source: 'Workday', location: 'Foster City, CA', date: subDays(now, 6) },
      { company: 'PwC', title: 'Data Engineer', status: 'Applied', source: 'LinkedIn', location: 'Boston, MA', date: subDays(now, 7) },
      { company: 'Deloitte', title: 'Cloud Security Analyst', status: 'Applied', source: 'Company Website', location: 'Chicago, IL', date: subDays(now, 9) },
    ];
    appsToSeed.push(...additionalApplied);

    const createdApplications = [];

    for (const app of appsToSeed) {
      let comp = companyDocs[app.company];
      if (!comp) {
        comp = await Company.create({
          userId,
          name: app.company,
          industry: 'Technology',
          location: app.location || 'Remote',
          website: `https://${app.company.toLowerCase()}.com`,
          notes: 'Added from application pipeline',
        });
        companyDocs[app.company] = comp;
      }

      const createdApp = await Application.create({
        userId,
        companyId: comp._id,
        companyName: app.company,
        companyLogo: comp.logo,
        jobTitle: app.title,
        jobDescription: `Responsible for building scalable web interfaces, distributed services, and microservices for ${app.company}.`,
        jobLocation: app.location,
        employmentType: app.title.includes('Intern') ? 'Internship' : 'Full-time',
        appliedDate: app.date,
        source: app.source,
        originalUrl: `https://${app.company.toLowerCase()}.com/careers/${encodeURIComponent(app.title)}`,
        status: app.status,
        salaryRange: app.salary || '$120,000 - $150,000',
        assessmentDeadline: app.deadline || null,
        interviewDate: app.interviewDate || null,
        notes: `Application recorded on Nexora. Tracking all status changes and email updates.`,
      });

      createdApplications.push(createdApp);

      // Create timeline event
      await ApplicationEvent.create({
        userId,
        applicationId: createdApp._id,
        eventType: app.status === 'Interview' ? 'Interview Scheduled' :
                   app.status === 'Assessment' ? 'Assessment Invitation' :
                   app.status === 'Offer' ? 'Offer Received' :
                   app.status === 'Rejected' ? 'Rejection Received' : 'Application Submitted',
        title: app.status === 'Interview' ? `Interview scheduled - ${app.company}` :
               app.status === 'Assessment' ? `Assessment received - ${app.company}` :
               app.status === 'Offer' ? `Formal Offer received - ${app.company}` :
               app.status === 'Rejected' ? `Application closed - ${app.company}` :
               `Application submitted - ${app.company}`,
        eventDate: app.date,
        source: 'manual',
        newStatus: app.status,
      });
    }

    console.log(`[Seed] Created ${createdApplications.length} applications with verified timeline events`);

    // Calendar Events (matching reference image)
    const blackRockApp = createdApplications.find(a => a.companyName === 'BlackRock');
    const natWestApp = createdApplications.find(a => a.companyName === 'NatWest');

    await CalendarEvent.create([
      {
        userId,
        applicationId: blackRockApp?._id,
        companyName: 'BlackRock',
        title: 'Technical Interview - BlackRock',
        eventType: 'Interview',
        startTime: addDays(now, 2),
        endTime: new Date(addDays(now, 2).getTime() + 3600000),
        location: 'Zoom Meeting',
        meetingLink: 'https://zoom.us/j/9823482711',
        notes: 'Coding and system design discussion with lead architect.',
      },
      {
        userId,
        applicationId: natWestApp?._id,
        companyName: 'NatWest',
        title: 'Follow-up - NatWest',
        eventType: 'Follow-up',
        startTime: addDays(now, 4),
        endTime: new Date(addDays(now, 4).getTime() + 1800000),
        location: 'Email / Phone',
        notes: 'Check status of online coding assessment.',
      },
      {
        userId,
        applicationId: createdApplications.find(a => a.companyName === 'PwC')?._id,
        companyName: 'PwC',
        title: 'HackerRank Deadline - PwC',
        eventType: 'Assessment Deadline',
        startTime: addDays(now, 3),
        endTime: new Date(addDays(now, 3).getTime() + 7200000),
        notes: '90-minute frontend algorithms and React challenge.',
      },
    ]);

    // Seed Processed Emails for Inbox Intelligence
    const visaApp = createdApplications.find(a => a.companyName === 'Visa');
    const pwcApp = createdApplications.find(a => a.companyName === 'PwC');
    const deloitteApp = createdApplications.find(a => a.companyName === 'Deloitte');

    await ProcessedEmail.create([
      {
        userId,
        emailConnectionId: emailConn._id,
        messageId: 'gmail_msg_visa_001',
        senderName: 'Visa Talent Acquisition',
        senderEmail: 'recruiting@visa.com',
        subject: 'Visa: Invitation to Technical Round Interview',
        snippet: 'Hi Adarsh, thank you for your patience. We were impressed with your background and would like to invite you to schedule a 45-minute technical interview...',
        receivedAt: new Date(Date.now() - 3600000 * 3), // Today, 3 hours ago
        detectedCategory: 'Interview',
        suggestedStatus: 'Interview',
        detectedCompany: 'Visa',
        detectedJobTitle: 'Software Engineer',
        matchConfidence: 94,
        matchedApplicationId: visaApp?._id,
        reviewStatus: 'pending',
      },
      {
        userId,
        emailConnectionId: emailConn._id,
        messageId: 'gmail_msg_pwc_002',
        senderName: 'PwC Campus Recruitment',
        senderEmail: 'campus.recruiting@pwc.com',
        subject: 'Action Required: PwC Technical Assessment Invitation',
        snippet: 'Dear Adarsh, thank you for applying for the Frontend Developer role. Please complete the online coding evaluation within 5 days...',
        receivedAt: subDays(now, 1),
        detectedCategory: 'Assessment',
        suggestedStatus: 'Assessment',
        detectedCompany: 'PwC',
        detectedJobTitle: 'Frontend Developer',
        matchConfidence: 91,
        matchedApplicationId: pwcApp?._id,
        reviewStatus: 'pending',
      },
      {
        userId,
        emailConnectionId: emailConn._id,
        messageId: 'gmail_msg_deloitte_003',
        senderName: 'Deloitte Careers',
        senderEmail: 'careers@deloitte.com',
        subject: 'Deloitte Application Confirmation - Analyst',
        snippet: 'We have successfully received your application for the Analyst position in Chicago. Our recruiting team is currently reviewing your qualifications...',
        receivedAt: subDays(now, 2),
        detectedCategory: 'Confirmation',
        suggestedStatus: 'Applied',
        detectedCompany: 'Deloitte',
        detectedJobTitle: 'Analyst',
        matchConfidence: 96,
        matchedApplicationId: deloitteApp?._id,
        reviewStatus: 'approved',
        appliedToTimeline: true,
      },
      {
        userId,
        emailConnectionId: emailConn._id,
        messageId: 'gmail_msg_uber_004',
        senderName: 'Uber Recruiting',
        senderEmail: 'careers-noreply@uber.com',
        subject: 'Update on your application with Uber',
        snippet: 'Thank you for taking the time to speak with our engineering team. At this time, we have decided to move forward with other candidates...',
        receivedAt: subDays(now, 6),
        detectedCategory: 'Rejection',
        suggestedStatus: 'Rejected',
        detectedCompany: 'Uber',
        detectedJobTitle: 'Software Engineer',
        matchConfidence: 89,
        matchedApplicationId: createdApplications.find(a => a.companyName === 'Uber')?._id,
        reviewStatus: 'approved',
        appliedToTimeline: true,
      },
    ]);

    // Achievements
    await Achievement.create([
      { userId, badgeKey: 'first_step', title: 'First Step', description: 'Added your first job application', icon: 'flag', category: 'application', unlocked: true, unlockedAt: subDays(now, 30), progress: 1, maxProgress: 1 },
      { userId, badgeKey: 'streak_starter', title: 'On Fire', description: 'Maintained a 7-day job search streak', icon: 'flame', category: 'streak', unlocked: true, unlockedAt: subDays(now, 5), progress: 12, maxProgress: 7 },
      { userId, badgeKey: 'interview_ready', title: 'In the Arena', description: 'Scheduled your first interview', icon: 'video', category: 'interview', unlocked: true, unlockedAt: subDays(now, 18), progress: 1, maxProgress: 1 },
      { userId, badgeKey: 'weekly_champion', title: 'Goal Crusher', description: 'Achieved your weekly application goal', icon: 'trophy', category: 'milestone', unlocked: true, unlockedAt: subDays(now, 7), progress: 5, maxProgress: 5 },
      { userId, badgeKey: 'offer_unlocked', title: 'Offer Landed', description: 'Received a formal job offer', icon: 'award', category: 'offer', unlocked: true, unlockedAt: subDays(now, 25), progress: 1, maxProgress: 1 },
      { userId, badgeKey: 'pipeline_pro', title: 'Pipeline Master', description: 'Tracked 20 or more applications', icon: 'layers', category: 'application', unlocked: true, unlockedAt: subDays(now, 10), progress: 36, maxProgress: 20 },
    ]);

    // Notifications
    await Notification.create([
      {
        userId,
        title: 'Interview invitation detected',
        message: 'Visa sent an interview invitation. Review suggestions in Inbox Intelligence.',
        type: 'email_detected',
        link: '/inbox',
        read: false,
      },
      {
        userId,
        title: 'Upcoming Interview',
        message: 'Technical Interview with BlackRock is in 2 days (Saturday at 2:00 PM).',
        type: 'reminder',
        link: '/calendar',
        read: false,
      },
      {
        userId,
        title: 'Weekly Goal Progress',
        message: "You've completed 3 of your 5 target applications this week. 60% reached!",
        type: 'system',
        link: '/dashboard',
        read: true,
      },
    ]);

    console.log('[Seed] Database populated successfully! All mock and live relations are ready.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
}

seed();

