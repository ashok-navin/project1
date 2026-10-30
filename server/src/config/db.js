import mongoose from 'mongoose';

let gridFSBucket = null;

export const connectDB = async (retries = 3, delay = 1500) => {
  // Reuse existing connection in serverless / lambda environments
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    if (!gridFSBucket && mongoose.connection.db) {
      gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'media'
      });
    }
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/5star_cinematography';

  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });

      console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);

      // Initialize GridFS bucket
      gridFSBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
        bucketName: 'media'
      });

      return conn;
    } catch (error) {
      console.error(`[MongoDB Connection Attempt ${i + 1}/${retries} failed]: ${error.message}`);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

export const getGridFSBucket = () => {
  if (!gridFSBucket) {
    if (mongoose.connection && mongoose.connection.db) {
      gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'media'
      });
    } else {
      throw new Error('Database not connected yet. GridFSBucket is unavailable.');
    }
  }
  return gridFSBucket;
};
