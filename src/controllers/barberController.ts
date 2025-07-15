// src/controllers/barberController.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// @desc    Criar um novo barbeiro
// @route   POST /api/barbers
// @access  Private (proteger com authMiddleware)
export const createBarber = async (req: Request, res: Response) => {
    const { nomeBarbeiro } = req.body;

    if (!nomeBarbeiro) {
        return res.status(400).json({ message: 'O nome do barbeiro é obrigatório.' });
    }

    try {
        const barber = await prisma.barber.create({
            data: {
                nomeBarbeiro
            }
        });
        res.status(201).json(barber);
    } catch (error: any) {
        console.error("Erro ao criar barbeiro:", error);
        res.status(500).json({ message: 'Erro ao criar barbeiro.', error: error.message });
    }
};

// @desc    Listar todos os barbeiros
// @route   GET /api/barbers
// @access  Public
export const getBarbers = async (req: Request, res: Response) => {
    try {
        const barbers = await prisma.barber.findMany();
        res.status(200).json(barbers);
    } catch (error: any) {
        console.error("Erro ao listar barbeiros:", error);
        res.status(500).json({ message: 'Erro ao listar barbeiros.', error: error.message });
    }
};

// @desc    Obter um barbeiro específico
// @route   GET /api/barbers/:id
// @access  Public
export const getBarberById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // ID do parâmetro da URL é string, precisa converter para Int para o Prisma com SQLite
        const barberId = parseInt(id); // <-- CORREÇÃO: Conversão de string para number
        if (isNaN(barberId)) { // <-- Boa prática: verifica se a conversão foi bem-sucedida
            return res.status(400).json({ message: 'ID de barbeiro inválido.' });
        }

        const barber = await prisma.barber.findUnique({
            where: { id: barberId } // <-- Usando o ID convertido
        });

        if (!barber) {
            return res.status(404).json({ message: 'Barbeiro não encontrado.' });
        }
        res.status(200).json(barber);
    } catch (error: any) {
        console.error("Erro ao obter barbeiro:", error);
        res.status(500).json({ message: 'Erro ao obter barbeiro.', error: error.message });
    }
};

// @desc    Atualizar um barbeiro
// @route   PUT /api/barbers/:id
// @access  Private (proteger com authMiddleware)
export const updateBarber = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nomeBarbeiro } = req.body;

    if (!nomeBarbeiro) {
        return res.status(400).json({ message: 'O nome do barbeiro não pode ser vazio.' });
    }

    try {
        // ID do parâmetro da URL é string, precisa converter para Int para o Prisma com SQLite
        const barberId = parseInt(id); // <-- CORREÇÃO: Conversão de string para number
        if (isNaN(barberId)) { // <-- Boa prática: verifica se a conversão foi bem-sucedida
            return res.status(400).json({ message: 'ID de barbeiro inválido.' });
        }

        const updatedBarber = await prisma.barber.update({
            where: { id: barberId }, // <-- Usando o ID convertido
            data: {
                nomeBarbeiro
            }
        });
        res.status(200).json(updatedBarber);
    } catch (error: any) {
        if (error.code === 'P2025' || error.message.includes('No Barber found')) {
            return res.status(404).json({ message: 'Barbeiro não encontrado para atualização.' });
        }
        console.error("Erro ao atualizar barbeiro:", error);
        res.status(500).json({ message: 'Erro ao atualizar barbeiro.', error: error.message });
    }
};

// @desc    Deletar um barbeiro
// @route   DELETE /api/barbers/:id
// @access  Private (proteger com authMiddleware)
export const deleteBarber = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // ID do parâmetro da URL é string, precisa converter para Int para o Prisma com SQLite
        const barberId = parseInt(id); // <-- CORREÇÃO: Conversão de string para number
        if (isNaN(barberId)) { // <-- Boa prática: verifica se a conversão foi bem-sucedida
            return res.status(400).json({ message: 'ID de barbeiro inválido.' });
        }

        await prisma.barber.delete({
            where: { id: barberId }, // <-- Usando o ID convertido
        });
        res.status(200).json({ message: 'Barbeiro deletado com sucesso.' });
    } catch (error: any) {
        if (error.code === 'P2025' || error.message.includes('No Barber found')) {
            return res.status(404).json({ message: 'Barbeiro não encontrado para exclusão.' });
        }
        console.error("Erro ao deletar barbeiro:", error);
        res.status(500).json({ message: 'Erro ao deletar barbeiro.', error: error.message });
    }
};