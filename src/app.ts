// src/server.ts (ou app.ts) - Exemplo, seu arquivo pode ter outras coisas
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes'; // As rotas de autenticação (register/login)
import barberRoutes from './routes/barberRoutes';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import prisma from './utils/prisma'; // Importa a instância do Prisma Client

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
    process.exit(1); // Sai da aplicação se não conseguir conectar
  });

// Rotas
app.use('/auth', authRoutes); // Prefira /auth para autenticação, como nos exemplos do Postman
app.use('/barbeiros', barberRoutes); // Ou '/barbers' se preferir
app.use('/servicos', serviceRoutes); // Ou '/services' se preferir
app.use('/agendamentos', appointmentRoutes); // Ou '/appointments' se preferir

// Rota de teste
app.get('/', (req, res) => {
    res.send('API da Barbearia está rodando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});