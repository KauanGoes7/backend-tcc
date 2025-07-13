// src/utils/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from './auth'; // Caminho ajustado
import prisma from './prisma'; // Importa a instância do Prisma Client
import { User } from '@prisma/client'; // Importa o tipo User do Prisma Client

interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
}

// Estende a interface Request do Express para incluir a propriedade 'user'
declare global {
  namespace Express {
    interface Request {
      user?: User; // Opcional, pois pode não estar autenticado em todas as rotas
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Pega o token após "Bearer "

            const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

            // Buscar o usuário pelo ID do token, mas SEM a senha
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, nome: true, email: true } // Seleciona apenas o que é seguro expor
            });

            if (!user) {
                return res.status(401).json({ message: 'Não autorizado, token falhou (usuário não encontrado).' });
            }

            // Anexar o usuário à requisição para uso em rotas posteriores
            req.user = user; 

            next(); // Prossegue para a próxima função middleware/rota
        } catch (error) {
            console.error("Erro na autenticação:", error);
            res.status(401).json({ message: 'Não autorizado, token inválido ou expirado.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
    }
};