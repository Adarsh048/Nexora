import mongoose from 'mongoose';
import dns from 'dns';

// Fallback to public DNS servers if local router/ISP blocks MongoDB SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Silent fallback if environment restricts DNS setting
}

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

  try {
    mongoose.set('strictQuery', false);
    cachedConn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully: ${cachedConn.connection.host}/${cachedConn.connection.name}`);
    return cachedConn;
  } catch (err) {
    console.error(`[MongoDB] Connection error:`, err.message);
    throw err;
  }
}
