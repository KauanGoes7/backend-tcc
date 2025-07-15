// src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import barberRoutes from './routes/barberRoutes';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import prisma from './utils/prisma'; 

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Conectar ao banco de dados Prisma
prisma.$connect()
  .then(() => {
    console.log('Conectado ao banco de dados com Prisma.');
  })
  .catch((e) => {
    console.error('Erro ao conectar ao banco de dados:', e);
    process.exit(1); 
  });

// Rotas
app.use('/auth', authRoutes); // Rota para autenticação (registro e login)
app.use('/barbeiros', barberRoutes); // Rotas para Barbeiro
app.use('/servicos', serviceRoutes);   // Rotas para Serviço
app.use('/agendamentos', appointmentRoutes); // Rotas para Agendamento

// Rota de teste simples
app.get('/', (req, res) => {
    res.send('API da Barbearia está rodando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});