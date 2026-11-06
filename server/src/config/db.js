import mongoose from 'mongoose';
import dns from 'dns';

// Ensure DNS servers include high-performance public DNS for MongoDB Atlas SRV lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore in restricted environments
}

let cachedConn = null;
let connectionPromise = null;

export async function connectDB() {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGO_URI || (process.env.NODE_ENV === 'development' ? 'mongodb://127.0.0.1:27017/nexora' : null);

  if (!uri) {
    const errorMsg = 'MONGO_URI is not set in environment variables. Please configure MONGO_URI in your environment.';
    console.error(`[MongoDB] Configuration Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Optimize Mongoose for high-throughput low-latency API traffic
  mongoose.set('strictQuery', false);
  mongoose.set('bufferCommands', false);

  const connectOptions = {
    serverSelectionTimeoutMS: 6000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    maxPoolSize: 50,
    minPoolSize: 10,
    maxIdleTimeMS: 30000,
  };

  connectionPromise = mongoose.connect(uri, connectOptions)
    .then((conn) => {
      cachedConn = conn;
      connectionPromise = null;
      console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name} (pool: 50 active)`);
      return conn;
    })
    .catch((err) => {
      connectionPromise = null;
      console.error('[MongoDB] Connection error:', err.message);
      throw err;
    });

  return connectionPromise;
}
