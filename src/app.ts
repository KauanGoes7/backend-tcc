// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes'; 
import barberRoutes from './routes/barberRoutes';
import appointmentRoutes from './routes/appointmentRoutes'; // Importe as rotas de agendamento

dotenv.config();

const app = express();

// Middlewares
app.use(express.json()); // Para parsear JSON no corpo da requisição
app.use(cors()); // Habilita o CORS

// Rotas da API
app.use('/api/users', authRoutes); // <-- CORREÇÃO AQUI: Mudado de '/api/auth' para '/api/users'
app.use('/api/services', serviceRoutes); 
app.use('/api/barbers', barberRoutes);
app.use('/api/appointments', appointmentRoutes); // Use a rota para /api/appointments

// Rota de teste
app.get('/', (req, res) => {
    res.send('API de Agendamento está rodando!');
});

export default app;