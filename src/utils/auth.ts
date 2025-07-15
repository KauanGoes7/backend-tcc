// src/utils/auth.ts
import jwt from 'jsonwebtoken';

// Certifique-se que JWT_SECRET está definido no seu arquivo .env
export const jwtSecret = process.env.JWT_SECRET || 'uma_chave_secreta_padrao_muito_segura'; 

export const generateToken = (id: number): string => {
    return jwt.sign({ id: id.toString() }, jwtSecret, { 
        expiresIn: '1h', // Define a expiração aqui. Não precisa exportar separadamente.
    });
};

export interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
}