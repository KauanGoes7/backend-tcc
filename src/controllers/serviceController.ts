// src/controllers/serviceController.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// @desc    Criar um novo serviço
// @route   POST /api/services
// @access  Private (proteger com authMiddleware)
export const createService = async (req: Request, res: Response) => {
    const { tema, nomeServico } = req.body;

    if (!tema || !nomeServico) {
        return res.status(400).json({ message: 'Tema e nome do serviço são obrigatórios.' });
    }

    const temasValidos = ['Cabelo', 'Barba', 'Cabelo + Barba'];
    if (!temasValidos.includes(tema)) {
        return res.status(400).json({ message: `Tema inválido. Use: ${temasValidos.join(', ')}` });
    }

    try {
        const service = await prisma.service.create({
            data: {
                tema,
                nomeServico
            }
        });
        res.status(201).json(service);
    } catch (error: any) {
        console.error("Erro ao criar serviço:", error);
        res.status(500).json({ message: 'Erro ao criar serviço.', error: error.message });
    }
};

// @desc    Listar todos os serviços
// @route   GET /api/services
// @access  Public
export const getServices = async (req: Request, res: Response) => {
    try {
        const services = await prisma.service.findMany();
        res.status(200).json(services);
    } catch (error: any) {
        console.error("Erro ao listar serviços:", error);
        res.status(500).json({ message: 'Erro ao listar serviços.', error: error.message });
    }
};

// @desc    Obter um serviço específico
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // ID do parâmetro da URL é string, precisa converter para Int para o Prisma com SQLite
        const serviceId = parseInt(id); // <-- CORREÇÃO: Conversão de string para number
        if (isNaN(serviceId)) { // <-- Boa prática: verifica se a conversão foi bem-sucedida
            return res.status(400).json({ message: 'ID de serviço inválido.' });
        }

        const service = await prisma.service.findUnique({
            where: { id: serviceId } // <-- Usando o ID convertido
        });

        if (!service) {
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }
        res.status(200).json(service);
    } catch (error: any) {
        console.error("Erro ao obter serviço:", error);
        res.status(500).json({ message: 'Erro ao obter serviço.', error: error.message });
    }
};

// @desc    Atualizar um serviço
// @route   PUT /api/services/:id
// @access  Private (proteger com authMiddleware)
export const updateService = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { tema, nomeServico } = req.body;

    const temasValidos = ['Cabelo', 'Barba', 'Cabelo + Barba'];
    if (tema && !temasValidos.includes(tema)) {
        return res.status(400).json({ message: `Tema inválido. Use: ${temasValidos.join(', ')}` });
    }

    try {
        // ID do parâmetro da URL é string, precisa converter para Int para o Prisma com SQLite
        const serviceId = parseInt(id); // <-- CORREÇÃO: Conversão de string para number
        if (isNaN(serviceId)) { // <-- Boa prática: verifica se a conversão foi bem-sucedida
            return res.status(400).json({ message: 'ID de serviço inválido.' });
        }

        const updatedService = await prisma.service.update({
            where: { id: serviceId }, // <-- Usando o ID convertido
            data: {
                tema,
                nomeServico
            }
        });
        res.status(200).json(updatedService);
    } catch (error: any) {
        if (error.code === 'P2025' || error.message.includes('No Service found')) {
            return res.status(404).json({ message: 'Serviço não encontrado para atualização.' });
        }
        console.error("Erro ao atualizar serviço:", error);
        res.status(500).json({ message: 'Erro ao atualizar serviço.', error: error.message });
    }
};

// @desc    Deletar um serviço
// @route   DELETE /api/services/:id
// @access  Private (proteger com authMiddleware)
export const deleteService = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // ID do parâmetro da URL é string, precisa converter para Int para o Prisma com SQLite
        const serviceId = parseInt(id); // <-- CORREÇÃO: Conversão de string para number
        if (isNaN(serviceId)) { // <-- Boa prática: verifica se a conversão foi bem-sucedida
            return res.status(400).json({ message: 'ID de serviço inválido.' });
        }

        await prisma.service.delete({
            where: { id: serviceId }, // <-- Usando o ID convertido
        });
        res.status(200).json({ message: 'Serviço deletado com sucesso.' });
    } catch (error: any) {
        if (error.code === 'P2025' || error.message.includes('No Service found')) {
            return res.status(404).json({ message: 'Serviço não encontrado para exclusão.' });
        }
        console.error("Erro ao deletar serviço:", error);
        res.status(500).json({ message: 'Erro ao deletar serviço.', error: error.message });
    }
};