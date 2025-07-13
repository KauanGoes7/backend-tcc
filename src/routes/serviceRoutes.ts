// src/routes/serviceRoutes.ts
import { Router } from 'express';
import { 
    createService, 
    getServices, 
    getServiceById, 
    updateService, 
    deleteService 
} from '../controllers/serviceController';
import { protect } from '../utils/authMiddleware'; // Exemplo de como usar o middleware

const router = Router();

// Rotas CRUD para Serviços
// Aqui você pode decidir quais rotas precisam de proteção (ex: apenas admin pode criar/editar/deletar)
router.route('/')
    .post(protect, createService) // Ex: Apenas usuário autenticado pode criar
    .get(getServices);   // Listar todos os serviços (pode ser público)

router.route('/:id')
    .get(getServiceById)   // Obter serviço por ID (pode ser público)
    .put(protect, updateService)    // Ex: Apenas usuário autenticado pode atualizar
    .delete(protect, deleteService); // Ex: Apenas usuário autenticado pode deletar

export default router;