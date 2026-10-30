import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

// Vercel Serverless Function Handler
export default async function handler(req, res) {
  try {
    // Ensure MongoDB connection is established or reused from cache
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('[Vercel Serverless Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Serverless database connection error. Please verify MONGODB_URI in Vercel settings.'
    });
  }
}
