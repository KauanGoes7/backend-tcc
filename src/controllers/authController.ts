// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtSecret, jwtExpiresIn } from '../utils/auth'; // Caminho ajustado
import prisma from '../utils/prisma';

// @desc    Registrar um novo usuário
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {
        // Verificar se o usuário já existe
        const userExists = await prisma.user.findUnique({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: 'Usuário já existe com este e-mail.' });
        }

        // Criptografar a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        // Criar o usuário
        const user = await prisma.user.create({
            data: {
                nome,
                email,
                senha: hashedPassword,
            },
            select: { id: true, nome: true, email: true } // Não retornar a senha
        });

        // Linha 44 (ou similar)
res.status(201).json({
    id: user.id,
    nome: user.nome,
    email: user.email,
    token: generateToken(user.id.toString()), // <-- Adicione .toString() aqui
});

// ...

// Linha 85 (ou similar)
res.json({
    id: user.id,
    nome: user.nome,
    email: user.email,
    token: generateToken(user.id.toString()), // <-- Adicione .toString() aqui
});
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao registrar usuário.', error: error.message });
    }
};

// @desc    Autenticar um usuário e obter token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {
        // Encontrar o usuário e incluir a senha para comparação (select: true no query)
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, nome: true, email: true, senha: true } // Explicitamente selecionar a senha
        });

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Comparar senhas
        const isMatch = await bcrypt.compare(senha, user.senha);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        res.json({
    id: user.id,
    nome: user.nome,
    email: user.email,
    token: generateToken(user.id.toString()), // <-- Adicione .toString() aqui
});

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao fazer login.', error: error.message });
    }
};

// Gerar JWT
const generateToken = (id: string): string => {
    return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
};