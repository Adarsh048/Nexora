import { google } from 'googleapis';
import EmailConnection from '../models/EmailConnection.js';
import ProcessedEmail from '../models/ProcessedEmail.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { classifyEmail, extractCompanyInfo, matchApplication } from '../utils/emailClassifier.js';

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/gmail/oauth/callback';

  if (!clientId || !clientSecret) {
    return null;
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function generateAuthUrl(userId) {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('Google OAuth credentials not configured in environment.');
  }

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state: userId.toString(),
  });
}

export async function exchangeCodeForTokens(code, userId) {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('Google OAuth credentials not configured.');
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  const emailAddress = userInfo.data.email;

  const encAccess = encrypt(tokens.access_token);
  const encRefresh = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;
  const expiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

  let connection = await EmailConnection.findOne({ userId });
  if (!connection) {
    connection = new EmailConnection({
      userId,
      emailAddress,
      accessTokenEncrypted: encAccess,
      refreshTokenEncrypted: encRefresh,
      tokenExpiry: expiry,
      connected: true,
      monitoringActive: true,
      lastSyncedAt: new Date(),
    });
  } else {
    connection.emailAddress = emailAddress;
    connection.accessTokenEncrypted = encAccess;
    if (encRefresh) connection.refreshTokenEncrypted = encRefresh;
    connection.tokenExpiry = expiry;
    connection.connected = true;
    connection.monitoringActive = true;
    connection.syncStatus = 'idle';
    connection.errorMessage = '';
  }

  await connection.save();
  return { connection, emailAddress };
}

export async function getAuthenticatedGmailClient(userId) {
  const connection = await EmailConnection.findOne({ userId, connected: true });
  if (!connection) return null;

  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) return null;

  const accessToken = decrypt(connection.accessTokenEncrypted);
  const refreshToken = decrypt(connection.refreshTokenEncrypted);

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: connection.tokenExpiry ? connection.tokenExpiry.getTime() : undefined,
  });

  oauth2Client.on('tokens', async (newTokens) => {
    if (newTokens.access_token) {
      connection.accessTokenEncrypted = encrypt(newTokens.access_token);
    }
    if (newTokens.expiry_date) {
      connection.tokenExpiry = new Date(newTokens.expiry_date);
    }
    await connection.save();
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function syncDemoEmails(userId, connection) {
  connection.syncStatus = 'syncing';
  await connection.save();

  try {
    const applications = await Application.find({ userId });
    let newItemsDetected = 0;

    const sampleScenarios = [
      {
        company: 'Google',
        role: 'Software Engineer',
        senderName: 'Google Recruiting',
        senderEmail: 'recruiting-team@google.com',
        subject: 'Invitation to Technical Interview: Google - Software Engineer',
        snippet: 'Hi there, Thank you for your interest in the Software Engineer position at Google. We reviewed your resume and would like to invite you to interview with our engineering team.',
      },
      {
        company: 'Stripe',
        role: 'Full Stack Engineer',
        senderName: 'Stripe Careers',
        senderEmail: 'offers@stripe.com',
        subject: 'Congratulations! Official Job Offer: Full Stack Engineer at Stripe',
        snippet: 'Dear candidate, We are thrilled to offer you the position of Full Stack Engineer at Stripe! Please find your official offer letter and compensation terms attached.',
      },
      {
        company: 'Amazon',
        role: 'Backend Developer',
        senderName: 'Amazon Web Services Talent',
        senderEmail: 'aws-assessment@amazon.com',
        subject: 'Amazon Online Assessment Invitation for Backend Developer',
        snippet: 'Hello, Thank you for applying to Amazon. The next step is a 60-minute technical coding assessment on HackerRank. Please complete the assessment within 5 days.',
      },
    ];

    const itemsToIngest = [];
    if (applications.length > 0) {
      for (const app of applications.slice(0, 3)) {
        const cleanName = app.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company';
        itemsToIngest.push({
          company: app.companyName,
          role: app.jobTitle,
          senderName: `${app.companyName} Talent Team`,
          senderEmail: `careers@${cleanName}.com`,
          subject: `Interview Invitation: Next round of interviews for ${app.jobTitle} at ${app.companyName}`,
          snippet: `Hi, Thank you for applying to ${app.companyName}. We would love to schedule your interview with the hiring manager for the ${app.jobTitle} role.`,
        });
      }
    } else {
      itemsToIngest.push(...sampleScenarios);
    }

    for (const item of itemsToIngest) {
      const messageId = `sim_sync_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const classification = classifyEmail({ subject: item.subject, sender: item.senderEmail, snippet: item.snippet });
      const entity = extractCompanyInfo(item.senderEmail, item.senderName, item.subject, item.snippet);
      const { matchedApp, confidence } = matchApplication({
        detectedCompany: entity.detectedCompany || item.company,
        detectedJobTitle: entity.detectedJobTitle || item.role,
        subject: item.subject,
        snippet: item.snippet,
        senderEmail: item.senderEmail,
      }, applications);

      const processed = new ProcessedEmail({
        userId,
        emailConnectionId: connection._id,
        messageId,
        threadId: `th_${messageId}`,
        senderName: item.senderName,
        senderEmail: item.senderEmail,
        subject: item.subject,
        snippet: item.snippet,
        receivedAt: new Date(),
        detectedCategory: classification.category,
        suggestedStatus: classification.suggestedStatus,
        detectedCompany: entity.detectedCompany || item.company,
        detectedJobTitle: entity.detectedJobTitle || item.role,
        matchConfidence: confidence,
        matchedApplicationId: matchedApp ? matchedApp._id : null,
        reviewStatus: 'pending',
      });

      await processed.save();
      newItemsDetected++;
    }

    connection.lastSyncedAt = new Date();
    connection.syncStatus = 'success';
    connection.errorMessage = '';
    await connection.save();

    if (newItemsDetected > 0) {
      await Notification.create({
        userId,
        title: 'New recruitment emails detected',
        message: `Nexora identified ${newItemsDetected} new recruitment email${newItemsDetected > 1 ? 's' : ''} awaiting your review.`,
        type: 'email_detected',
        link: '/inbox',
      });
    }

    return {
      success: true,
      newItemsDetected,
      totalChecked: itemsToIngest.length,
      lastSyncedAt: connection.lastSyncedAt,
      isDemo: true,
      message: `Scan complete: ${newItemsDetected} new recruitment communications detected.`,
    };
  } catch (err) {
    connection.syncStatus = 'error';
    connection.errorMessage = err.message;
    await connection.save();
    return { success: false, message: err.message };
  }
}

export async function syncUserEmails(userId, maxResults = 25) {
  const connection = await EmailConnection.findOne({ userId });
  if (!connection || !connection.connected) {
    return { success: false, message: 'Gmail is not connected.' };
  }

  // If connection is in demo mode or Google credentials are not in environment, use demo sync engine
  if (connection.isDemo || !isGoogleConfigured()) {
    return syncDemoEmails(userId, connection);
  }

  connection.syncStatus = 'syncing';
  await connection.save();

  try {
    const gmail = await getAuthenticatedGmailClient(userId);
    if (!gmail) {
      connection.syncStatus = 'error';
      connection.errorMessage = 'Failed to authenticate with Google API';
      await connection.save();
      return { success: false, message: connection.errorMessage };
    }

    // Recruitment search query
    const query = 'subject:(application OR interview OR assessment OR offer OR "moving forward" OR "regret to inform" OR "thank you for applying") OR from:(recruiting OR careers OR jobs OR greenhouse OR lever OR workday)';
    
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    const messages = listResponse.data.messages || [];
    const applications = await Application.find({ userId });
    let newItemsDetected = 0;

    for (const msgRef of messages) {
      // Check if already processed
      const existing = await ProcessedEmail.findOne({ userId, messageId: msgRef.id });
      if (existing) continue;

      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msgRef.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      });

      const headers = detail.data.payload.headers || [];
      const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
      const fromHeader = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
      const dateHeader = headers.find(h => h.name.toLowerCase() === 'date')?.value;
      const snippet = detail.data.snippet || '';

      // Parse sender name & email
      let senderName = '';
      let senderEmail = fromHeader;
      const senderMatch = fromHeader.match(/^(.*?)\s*<([^>]+)>/);
      if (senderMatch) {
        senderName = senderMatch[1].replace(/["']/g, '').trim();
        senderEmail = senderMatch[2].trim();
      }

      // Classification & entity extraction
      const classification = classifyEmail({ subject: subjectHeader, sender: fromHeader, snippet });
      const entity = extractCompanyInfo(senderEmail, senderName, subjectHeader, snippet);

      // Match against user applications
      const { matchedApp, confidence } = matchApplication({
        detectedCompany: entity.detectedCompany,
        detectedJobTitle: entity.detectedJobTitle,
        subject: subjectHeader,
        snippet,
        senderEmail,
      }, applications);

      const processed = new ProcessedEmail({
        userId,
        emailConnectionId: connection._id,
        messageId: msgRef.id,
        threadId: detail.data.threadId || '',
        senderName,
        senderEmail,
        subject: subjectHeader,
        snippet,
        receivedAt: dateHeader ? new Date(dateHeader) : new Date(),
        detectedCategory: classification.category,
        suggestedStatus: classification.suggestedStatus,
        detectedCompany: entity.detectedCompany,
        detectedJobTitle: entity.detectedJobTitle,
        matchConfidence: confidence,
        matchedApplicationId: matchedApp ? matchedApp._id : null,
        reviewStatus: 'pending',
      });

      await processed.save();
      newItemsDetected++;
    }

    connection.lastSyncedAt = new Date();
    connection.syncStatus = 'success';
    connection.errorMessage = '';
    await connection.save();

    if (newItemsDetected > 0) {
      await Notification.create({
        userId,
        title: 'New recruitment emails detected',
        message: `Nexora identified ${newItemsDetected} new recruitment email${newItemsDetected > 1 ? 's' : ''} awaiting your review.`,
        type: 'email_detected',
        link: '/inbox',
      });
    }

    return {
      success: true,
      newItemsDetected,
      totalChecked: messages.length,
      lastSyncedAt: connection.lastSyncedAt,
    };

  } catch (err) {
    console.error('[Gmail Sync Error]:', err.message);
    connection.syncStatus = 'error';
    connection.errorMessage = err.message;
    await connection.save();
    return { success: false, message: err.message };
  }
}

