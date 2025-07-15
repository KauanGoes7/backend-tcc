// src/utils/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from './auth'; // Caminho ajustado
import prisma from './prisma'; // Importa a instância do Prisma Client
import { User } from '@prisma/client'; // Importa o tipo User do Prisma Client

// Define um tipo seguro para o usuário, sem senha e datas sensíveis
export type SafeUser = Pick<User, 'id' | 'nome' | 'email'>;

// A interface DecodedToken deve refletir o tipo do ID no seu banco de dados
// Se o ID no Prisma é Int, então decoded.id deve ser number
interface DecodedToken {
    id: number; // <-- CORREÇÃO: id agora é number
    iat: number;
    exp: number;
}

// Estende a interface Request do Express para incluir a propriedade 'user'
declare global {
    namespace Express {
        interface Request {
            user?: SafeUser; // Opcional, pois pode não estar autenticado em todas as rotas
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Pega o token após "Bearer "

            // Verifica e decodifica o token. O 'id' será interpretado como number
            const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

            // Buscar o usuário pelo ID do token, mas SEM a senha
            // decoded.id já é number devido à interface DecodedToken
            const user = await prisma.user.findUnique({
                where: { id: decoded.id }, // decoded.id agora é number, sem necessidade de parseInt
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
            // Verifica se o erro é de TokenExpiredError ou JsonWebTokenError
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ message: 'Não autorizado, token expirado.' });
            }
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: 'Não autorizado, token inválido.' });
            }
            res.status(401).json({ message: 'Não autorizado, erro de autenticação desconhecido.' });
        }
    } else { // Movido o bloco de verificação de token ausente para um 'else' ou 'if (!token)' no final
        res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
    }
};