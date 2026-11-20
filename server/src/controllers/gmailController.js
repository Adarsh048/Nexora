import EmailConnection from '../models/EmailConnection.js';
import { isGoogleConfigured, generateAuthUrl, exchangeCodeForTokens, syncUserEmails, configureGoogleCredentials } from '../services/gmailService.js';
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

    const from = req.query.from || 'settings';
    const url = generateAuthUrl(req.user._id, { from });
    res.status(200).json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function oauthCallback(req, res) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    const { code, state, error } = req.query;

    let targetUserId = state;
    let returnPath = '/settings?tab=integrations';
    if (state) {
      try {
        const parsed = JSON.parse(state);
        if (parsed.userId) {
          targetUserId = parsed.userId;
          if (parsed.from === 'inbox') {
            returnPath = '/inbox';
          }
        }
      } catch (e) {
        // state is plain userId string
      }
    }

    const sep = returnPath.includes('?') ? '&' : '?';

    if (error) {
      let friendlyError = error;
      if (error === 'access_denied') {
        friendlyError = 'Google authorization was denied or cancelled.';
      } else if (error === 'redirect_uri_mismatch') {
        friendlyError = 'Redirect URI mismatch. Please ensure http://localhost:5000/api/gmail/oauth/callback is registered in your Google Cloud Console.';
      }
      return res.redirect(`${clientUrl}${returnPath}${sep}error=${encodeURIComponent(friendlyError)}`);
    }

    if (!code || !targetUserId) {
      return res.redirect(`${clientUrl}${returnPath}${sep}error=missing_code_or_state`);
    }

    // Exchange authorization code for live tokens
    await exchangeCodeForTokens(code, targetUserId);

    // Enqueue initial sync job
    await addJob('sync-gmail', { userId: targetUserId });

    res.redirect(`${clientUrl}${returnPath}${sep}success=gmail_connected`);
  } catch (err) {
    console.error('OAuth Callback Error:', err.message);
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

export async function configureCredentials(req, res) {
  try {
    const { clientId, clientSecret, redirectUri } = req.body;
    if (!clientId || !clientSecret) {
      return res.status(400).json({ success: false, message: 'Google Client ID and Client Secret are required.' });
    }

    await configureGoogleCredentials({ clientId, clientSecret, redirectUri });

    let authUrl = null;
    try {
      authUrl = generateAuthUrl(req.user._id, { from: req.query.from || 'settings' });
    } catch (e) {
      // Ignored if generation throws
    }

    res.status(200).json({
      success: true,
      message: 'Google Cloud credentials saved successfully. You can now authorize your live Gmail account.',
      data: { isConfigured: true, authUrl },
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

