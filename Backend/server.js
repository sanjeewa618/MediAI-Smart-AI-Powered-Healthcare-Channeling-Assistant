import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routers/authRoutes.js';

// 1. Load environment variables FIRST
dotenv.config();

// 2. Connect to Database AFTER env is loaded
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 3. Mount Route Paths
app.use('/api/auth', authRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('MediAI API is running...');
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
