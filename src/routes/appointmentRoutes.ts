// src/routes/appointmentRoutes.ts
import { Router } from 'express';
import { createAppointment, getUserAppointments, getAppointmentById, updateAppointment, deleteAppointment } from '../controllers/appointmentController';
// Certifique-se de que authMiddleware está sendo importado corretamente
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createAppointment);
router.get('/', authMiddleware, getUserAppointments);
router.get('/:id', authMiddleware, getAppointmentById);
router.put('/:id', authMiddleware, updateAppointment);
router.delete('/:id', authMiddleware, deleteAppointment);

export default router;