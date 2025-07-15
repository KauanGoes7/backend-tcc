// src/routes/barberRoutes.ts
import { Router } from 'express';
import { createBarber, getAllBarbers, getBarberById, updateBarber, deleteBarber } from '../controllers/barberController';
// Certifique-se de que authMiddleware está sendo importado corretamente
import { authMiddleware } from '../utils/authMiddleware'; 

const router = Router();

router.post('/', authMiddleware, createBarber);
router.get('/', authMiddleware, getAllBarbers);
router.get('/:id', authMiddleware, getBarberById);
router.put('/:id', authMiddleware, updateBarber);
router.delete('/:id', authMiddleware, deleteBarber);

export default router;