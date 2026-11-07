import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
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

export async function configureGoogleCredentials({ clientId, clientSecret, redirectUri }) {
  if (clientId) process.env.GOOGLE_CLIENT_ID = clientId.trim();
  if (clientSecret) process.env.GOOGLE_CLIENT_SECRET = clientSecret.trim();
  if (redirectUri) process.env.GOOGLE_REDIRECT_URI = redirectUri.trim();

  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'server', '.env'),
  ];

  for (const envPath of envPaths) {
    try {
      let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      
      const updateOrAppend = (key, val) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(content)) {
          content = content.replace(regex, `${key}=${val}`);
        } else {
          content += `\n${key}=${val}`;
        }
      };

      if (clientId) updateOrAppend('GOOGLE_CLIENT_ID', clientId.trim());
      if (clientSecret) updateOrAppend('GOOGLE_CLIENT_SECRET', clientSecret.trim());
      if (redirectUri) updateOrAppend('GOOGLE_REDIRECT_URI', redirectUri.trim());

      fs.writeFileSync(envPath, content.trim() + '\n', 'utf8');
    } catch (e) {
      console.warn(`Could not update env file at ${envPath}:`, e.message);
    }
  }

  return true;
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

function extractGmailBody(payload, fallbackSnippet = '') {
  try {
    if (!payload) return fallbackSnippet;

    if (payload.body && payload.body.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf8');
    }

    if (payload.parts && payload.parts.length > 0) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf8');
        }
      }
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          const html = Buffer.from(part.body.data, 'base64').toString('utf8');
          return html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      }
    }
  } catch (e) {
    console.warn('Could not decode Gmail message body, using snippet:', e.message);
  }
  return fallbackSnippet || '';
}

export async function syncUserEmails(userId, maxResults = 50) {
  const connection = await EmailConnection.findOne({ userId });
  if (!connection || !connection.connected) {
    return {
      success: false,
      message: 'Gmail is not connected. Connect your Google account in Settings or use the Real Email Ingestion tool.',
    };
  }

  if (!isGoogleConfigured()) {
    return {
      success: false,
      message: 'Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are required to sync live Google accounts.',
    };
  }

  connection.syncStatus = 'syncing';
  await connection.save();

  try {
    const gmail = await getAuthenticatedGmailClient(userId);
    if (!gmail) {
      connection.syncStatus = 'error';
      connection.errorMessage = 'Failed to authenticate with Google API. Your session may have expired.';
      await connection.save();
      return { success: false, message: connection.errorMessage };
    }

    // Comprehensive recruitment search query covering all major ATS and keywords
    const query = 'subject:(interview OR assessment OR offer OR application OR candidacy OR "moving forward" OR "regret to inform" OR "thank you for applying" OR "next steps" OR "hackerrank" OR "codesignal" OR "codility") OR from:(recruiting OR careers OR jobs OR greenhouse OR lever OR workday OR ashby OR smartrecruiters OR icims OR taleo OR bamboohr)';
    
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
        format: 'full',
      });

      const headers = detail.data.payload?.headers || [];
      const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
      const fromHeader = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
      const dateHeader = headers.find(h => h.name.toLowerCase() === 'date')?.value;
      const snippet = detail.data.snippet || '';
      const fullBody = extractGmailBody(detail.data.payload, snippet);

      // Parse sender name & email
      let senderName = '';
      let senderEmail = fromHeader;
      const senderMatch = fromHeader.match(/^(.*?)\s*<([^>]+)>/);
      if (senderMatch) {
        senderName = senderMatch[1].replace(/["']/g, '').trim();
        senderEmail = senderMatch[2].trim();
      }

      // High-precision classification & entity extraction
      const classification = classifyEmail({ subject: subjectHeader, sender: fromHeader, snippet: fullBody });
      const entity = extractCompanyInfo(senderEmail, senderName, subjectHeader, fullBody);

      // Match against user applications
      const { matchedApp, confidence } = matchApplication({
        detectedCompany: entity.detectedCompany,
        detectedJobTitle: entity.detectedJobTitle,
        subject: subjectHeader,
        snippet: fullBody,
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
        snippet: fullBody.length > 800 ? fullBody.substring(0, 800) + '...' : fullBody,
        receivedAt: dateHeader ? new Date(dateHeader) : new Date(),
        detectedCategory: classification.category,
        suggestedStatus: classification.suggestedStatus,
        detectedCompany: matchedApp ? matchedApp.companyName : entity.detectedCompany,
        detectedJobTitle: matchedApp ? matchedApp.jobTitle : entity.detectedJobTitle,
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

