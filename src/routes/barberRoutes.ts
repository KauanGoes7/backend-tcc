// src/routes/barberRoutes.ts
import { Router } from 'express';
import { 
    createBarber, 
    getBarbers, 
    getBarberById, 
    updateBarber, 
    deleteBarber 
} from '../controllers/barberController';
import { protect } from '../utils/authMiddleware'; // Exemplo de como usar o middleware

const router = Router();

// Rotas CRUD para Barbeiros
router.route('/')
    .post(protect, createBarber) // Ex: Apenas usuário autenticado pode criar
    .get(getBarbers);   // Listar todos os barbeiros (pode ser público)

router.route('/:id')
    .get(getBarberById)   // Obter barbeiro por ID (pode ser público)
    .put(protect, updateBarber)    // Ex: Apenas usuário autenticado pode atualizar
    .delete(protect, deleteBarber); // Ex: Apenas usuário autenticado pode deletar

export default router;