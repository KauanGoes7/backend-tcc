// src/utils/express.d.ts
import { User } from '@prisma/client'; // Importa o tipo User gerado pelo Prisma Client

// Estende a interface Request do Express para adicionar a propriedade 'user'
declare global {
  namespace Express {
    interface Request {
      user?: User; // Adiciona uma propriedade 'user' opcional do tipo User (do Prisma) à Request
    }
  }
}