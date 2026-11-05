import EmailConnection from '../models/EmailConnection.js';
import { isGoogleConfigured, generateAuthUrl, exchangeCodeForTokens, syncUserEmails } from '../services/gmailService.js';
import { addJob } from '../services/queueService.js';

export async function getGmailStatus(req, res) {
  try {
    const isConfigured = isGoogleConfigured();
    const connection = await EmailConnection.findOne({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        isConfigured,
        connected: Boolean(connection && connection.connected),
        emailAddress: connection?.emailAddress || null,
        lastSyncedAt: connection?.lastSyncedAt || null,
        syncStatus: connection?.syncStatus || 'idle',
        errorMessage: connection?.errorMessage || null,
        monitoringActive: Boolean(connection?.monitoringActive),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAuthUrl(req, res) {
  try {
    if (!isGoogleConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are not configured in backend environment.',
      });
    }

    const url = generateAuthUrl(req.user._id);
    res.status(200).json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function oauthCallback(req, res) {
  try {
    const { code, state, error } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (error) {
      return res.redirect(`${clientUrl}/settings?tab=integrations&error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return res.redirect(`${clientUrl}/settings?tab=integrations&error=missing_code_or_state`);
    }

    // state contains userId
    await exchangeCodeForTokens(code, state);

    // Enqueue initial sync job
    await addJob('sync-gmail', { userId: state });

    res.redirect(`${clientUrl}/settings?tab=integrations&success=gmail_connected`);
  } catch (err) {
    console.error('OAuth Callback Error:', err.message);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/settings?tab=integrations&error=${encodeURIComponent(err.message)}`);
  }
}

export async function syncNow(req, res) {
  try {
    const result = await syncUserEmails(req.user._id);
    res.status(200).json({
      success: result.success,
      data: result,
      message: result.message || 'Sync completed',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function disconnect(req, res) {
  try {
    const connection = await EmailConnection.findOne({ userId: req.user._id });
    if (!connection) {
      return res.status(404).json({ success: false, message: 'No connection found' });
    }

    connection.connected = false;
    connection.monitoringActive = false;
    connection.accessTokenEncrypted = null;
    connection.refreshTokenEncrypted = null;
    connection.syncStatus = 'idle';
    await connection.save();

    res.status(200).json({
      success: true,
      message: 'Gmail disconnected successfully. Existing processed updates remain archived in Nexora.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

