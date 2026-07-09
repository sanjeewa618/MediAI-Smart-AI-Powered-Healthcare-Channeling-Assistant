import express from 'express';
import { createPrescription, getPrescriptions, getPrescriptionById, deletePrescription } from '../controllers/prescriptionController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { doctorOnly } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Require auth for all prescription routes
router.use(protect);

router.post('/', doctorOnly, createPrescription);
router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.delete('/:id', deletePrescription);

export default router;
