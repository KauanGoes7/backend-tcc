// src/routes/serviceRoutes.ts
import { Router } from 'express';
import { createService, getAllServices, getServiceById, updateService, deleteService } from '../controllers/serviceController'; 
import { authMiddleware } from '../utils/authMiddleware'; 

const router = Router();

router.post('/', authMiddleware, createService);
router.get('/', authMiddleware, getAllServices); 
router.get('/:id', authMiddleware, getServiceById);
router.put('/:id', authMiddleware, updateService);
router.delete('/:id', authMiddleware, deleteService);

export default router;