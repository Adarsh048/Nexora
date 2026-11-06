import mongoose from 'mongoose';
import dns from 'dns';

let cachedConn = null;

export async function connectDB() {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  const uri = process.env.MONGO_URI || (process.env.NODE_ENV === 'development' ? 'mongodb://127.0.0.1:27017/nexora' : null);

  if (!uri) {
    const errorMsg = 'MONGO_URI is not set in environment variables. Please configure MONGO_URI in your Render Dashboard -> Environment.';
    console.error(`[MongoDB] Configuration Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Prevent Mongoose from freezing requests for 10 seconds if disconnected
  mongoose.set('strictQuery', false);
  mongoose.set('bufferCommands', false);

  const connectOptions = {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };

  try {
    // 1. First attempt with default system DNS (required for Linux/Render/Docker/Cloud)
    cachedConn = await mongoose.connect(uri, connectOptions);
    console.log(`[MongoDB] Connected successfully: ${cachedConn.connection.host}/${cachedConn.connection.name}`);
    return cachedConn;
  } catch (err) {
    // 2. If SRV lookup fails (common on local Windows ISPs), fallback to public DNS and retry
    if (err.code === 'ECONNREFUSED' && (err.syscall === 'querySrv' || err.message.includes('querySrv'))) {
      console.warn('[MongoDB] System DNS refused SRV query. Retrying with Google/Cloudflare DNS fallback...');
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        cachedConn = await mongoose.connect(uri, connectOptions);
        console.log(`[MongoDB] Connected with DNS fallback: ${cachedConn.connection.host}/${cachedConn.connection.name}`);
        return cachedConn;
      } catch (retryErr) {
        console.error('[MongoDB] Connection failed after DNS fallback:', retryErr.message);
        throw retryErr;
      }
    }

    console.error('[MongoDB] Connection error:', err.message);
    throw err;
  }
}
