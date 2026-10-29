import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas & Start Server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`★ 5STAR CINEMATOGRAPHY SERVER RUNNING ON PORT ${PORT} ★`);
      console.log(`★ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`★ Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal: Server initialization failed:', error);
    process.exit(1);
  }
};

startServer();
