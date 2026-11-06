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

  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexora';
    mongoose.set('strictQuery', false);
    cachedConn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to Atlas: ${cachedConn.connection.host}/${cachedConn.connection.name}`);
    return cachedConn;
  } catch (err) {
    console.error(`[MongoDB] Connection error:`, err.message);
    throw err;
  }
}
