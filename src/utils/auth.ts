// src/utils/auth.ts
import dotenv from 'dotenv';
dotenv.config();

export const jwtSecret = process.env.JWT_SECRET || 'umaChaveSecretaMuitoForteParaProducao'; // Use uma chave forte no .env
export const jwtExpiresIn = '1d'; // Token expira em 1 dia