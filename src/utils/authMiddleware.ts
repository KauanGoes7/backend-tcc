// src/utils/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret, DecodedToken } from './auth';
import prisma from './prisma';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
            };
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
        const userId = parseInt(decoded.id, 10); 
        
        if (isNaN(userId)) {
            return res.status(401).json({ message: 'Token inválido: ID do usuário não é um número válido.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token expirado.' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Token inválido.' });
        }
        console.error('Erro na autenticação:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};