// src/controllers/barberController.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createBarber = async (req: Request, res: Response) => {
    const { nomeBarbeiro } = req.body;

    if (!nomeBarbeiro) {
        return res.status(400).json({ message: 'Nome do barbeiro é obrigatório.' });
    }

    try {
        const newBarber = await prisma.barbeiro.create({ // CORRIGIDO: de prisma.barber para prisma.barbeiro
            data: {
                nomeBarbeiro,
            },
        });
        res.status(201).json(newBarber);
    } catch (error: any) {
        console.error('Erro ao criar barbeiro:', error);
        if (error.code === 'P2002') { 
            return res.status(409).json({ message: 'Já existe um barbeiro com este nome.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao criar barbeiro.' });
    }
};

export const getAllBarbers = async (req: Request, res: Response) => {
    try {
        const barbers = await prisma.barbeiro.findMany(); // CORRIGIDO: de prisma.barber para prisma.barbeiro
        res.status(200).json(barbers);
    } catch (error) {
        console.error('Erro ao buscar barbeiros:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar barbeiros.' });
    }
};

export const getBarberById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10); 

    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de barbeiro inválido.' });
    }

    try {
        const barber = await prisma.barbeiro.findUnique({ // CORRIGIDO: de prisma.barber para prisma.barbeiro
            where: { id },
        });

        if (!barber) {
            return res.status(404).json({ message: 'Barbeiro não encontrado.' });
        }
        res.status(200).json(barber);
    } catch (error) {
        console.error('Erro ao buscar barbeiro por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar barbeiro.' });
    }
};

export const updateBarber = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10); 
    const { nomeBarbeiro } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de barbeiro inválido.' });
    }
    if (!nomeBarbeiro) {
        return res.status(400).json({ message: 'Nome do barbeiro é obrigatório para atualização.' });
    }

    try {
        const updatedBarber = await prisma.barbeiro.update({ // CORRIGIDO: de prisma.barber para prisma.barbeiro
            where: { id },
            data: { nomeBarbeiro },
        });
        res.status(200).json(updatedBarber);
    } catch (error: any) {
        console.error('Erro ao atualizar barbeiro:', error);
        if (error.code === 'P2025') { 
            return res.status(404).json({ message: 'Barbeiro não encontrado para atualização.' });
        }
        if (error.code === 'P2002') { 
            return res.status(409).json({ message: 'Já existe outro barbeiro com este nome.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar barbeiro.' });
    }
};

export const deleteBarber = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10); 

    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de barbeiro inválido.' });
    }

    try {
        await prisma.barbeiro.delete({ // CORRIGIDO: de prisma.barber para prisma.barbeiro
            where: { id },
        });
        res.status(204).send();
    } catch (error: any) {
        console.error('Erro ao deletar barbeiro:', error);
        if (error.code === 'P2025') { 
            return res.status(404).json({ message: 'Barbeiro não encontrado para exclusão.' });
        }
        if (error.code === 'P2003') {
            return res.status(409).json({ message: 'Não é possível deletar barbeiro com agendamentos existentes.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao deletar barbeiro.' });
    }
};