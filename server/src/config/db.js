import mongoose from 'mongoose';

let cachedConn = null;

export async function connectDB() {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexora';
    mongoose.set('strictQuery', false);
    cachedConn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to: ${cachedConn.connection.host}/${cachedConn.connection.name}`);
    return cachedConn;
  } catch (err) {
    console.error(`[MongoDB] Connection error:`, err.message);
    if (process.env.NODE_ENV !== 'production') {
      // In development allow restart
    }
    throw err;
  }
}
