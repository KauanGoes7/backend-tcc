// src/routes/appointmentRoutes.ts
import { Router } from 'express';
import { 
    createAppointment, 
    getMyAppointments, 
    getAppointmentById, 
    updateAppointment, 
    deleteAppointment 
} from '../controllers/appointmentController';
import { protect } from '../utils/authMiddleware';

const router = Router();

// Todas as rotas de agendamento exigirão que o usuário esteja autenticado
router.route('/')
    .post(protect, createAppointment)   // Criar agendamento
    .get(protect, getMyAppointments); // Listar agendamentos do usuário logado

router.route('/:id')
    .get(protect, getAppointmentById)   // Obter agendamento por ID (do usuário logado)
    .put(protect, updateAppointment)    // Atualizar agendamento (do usuário logado)
    .delete(protect, deleteAppointment); // Deletar agendamento (do usuário logado)

export default router;