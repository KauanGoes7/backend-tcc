// src/server.ts
import app from './app';
import prisma from './utils/prisma'; // Importa a instância do Prisma Client

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Conectar ao banco de dados usando Prisma (implicitamente via `prisma.$connect()`)
        await prisma.$connect();
        console.log('Conectado ao banco de dados com Prisma.');

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Acesse: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados ou iniciar o servidor:', error);
        process.exit(1); // Sai do processo com erro
    } finally {
        // Opcional: desconectar Prisma em caso de encerramento limpo (não necessário para apps em execução)
        // await prisma.$disconnect();
    }
};

startServer();