import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routers/authRoutes.js';
import patientRoutes from './routers/patientRoutes.js';
import doctorRoutes from './routers/doctorRoutes.js';
import nurseRoutes from './routers/nurseRoutes.js';
import adminRoutes from './routers/adminRoutes.js';
import appointmentRoutes from './routers/appointmentRoutes.js';
import messageRoutes from './routers/messageRoutes.js';
import aiRoutes from './routers/aiRoutes.js';
import prescriptionRoutes from './routers/prescriptionRoutes.js';
import labRoutes from './routers/labRoutes.js';
import medicalRecordRoutes from './routers/medicalRecordRoutes.js';
import notificationRoutes from './routers/notificationRoutes.js';
// 1. Load environment variables FIRST
dotenv.config();

// 2. Connect to Database AFTER env is loaded
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Mount Route Paths
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/notifications', notificationRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('MediAI API is running...');
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start Server - listen on 0.0.0.0 to be reachable from mobile devices on local network
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} and accessible over local network`);
});
