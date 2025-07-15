// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/auth';

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {
        const userExists = await prisma.user.findUnique({ where: { email } });

        if (userExists) {
            return res.status(409).json({ message: 'Usuário já existe com este email.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        const token = generateToken(newUser.id);

        res.status(201).json({
            message: 'Usuário registrado com sucesso!',
            user: {
                id: newUser.id,
                name: newUser.name, // Incluir o nome aqui
                email: newUser.email,
            },
            token,
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body; // A senha enviada está em 'password'

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, preencha email e senha.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true, password: true }, // CORRIGIDO: Selecionar o password para comparação
        });

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas: Email ou senha incorretos.' });
        }

        // CORRIGIDO: Comparar a senha fornecida (password) com a senha do banco de dados (user.password)
        const isMatch = await bcrypt.compare(password, user.password); 

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas: Email ou senha incorretos.' });
        }

        const token = generateToken(user.id);

        res.status(200).json({
            message: 'Login bem-sucedido!',
            user: {
                id: user.id,
                name: user.name, // Incluir o nome aqui
                email: user.email,
            },
            token,
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
    }
};