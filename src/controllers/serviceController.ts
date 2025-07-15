// src/controllers/serviceController.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createService = async (req: Request, res: Response) => {
    const { tema, nomeServico } = req.body;

    if (!tema || !nomeServico) {
        return res.status(400).json({ message: 'Tema e nome do serviço são obrigatórios.' });
    }

    try {
        const newService = await prisma.servico.create({ // CORRIGIDO: de prisma.service para prisma.servico
            data: {
                tema,
                nomeServico,
            },
        });
        res.status(201).json(newService);
    } catch (error: any) {
        console.error('Erro ao criar serviço:', error);
        if (error.code === 'P2002') { 
            return res.status(409).json({ message: 'Já existe um serviço com este nome.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao criar serviço.' });
    }
};

export const getAllServices = async (req: Request, res: Response) => {
    try {
        const services = await prisma.servico.findMany(); // CORRIGIDO: de prisma.service para prisma.servico
        res.status(200).json(services);
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar serviços.' });
    }
};

export const getServiceById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10); 

    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de serviço inválido.' });
    }

    try {
        const service = await prisma.servico.findUnique({ // CORRIGIDO: de prisma.service para prisma.servico
            where: { id },
        });

        if (!service) {
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }
        res.status(200).json(service);
    } catch (error) {
        console.error('Erro ao buscar serviço por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar serviço.' });
    }
};

export const updateService = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10); 
    const { tema, nomeServico } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de serviço inválido.' });
    }
    if (!tema && !nomeServico) {
        return res.status(400).json({ message: 'Pelo menos um campo (tema ou nomeServico) deve ser fornecido para atualização.' });
    }

    try {
        const updatedService = await prisma.servico.update({ // CORRIGIDO: de prisma.service para prisma.servico
            where: { id },
            data: { tema, nomeServico },
        });
        res.status(200).json(updatedService);
    } catch (error: any) {
        console.error('Erro ao atualizar serviço:', error);
        if (error.code === 'P2025') { 
            return res.status(404).json({ message: 'Serviço não encontrado para atualização.' });
        }
        if (error.code === 'P2002') { 
            return res.status(409).json({ message: 'Já existe outro serviço com este nome.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar serviço.' });
    }
};

export const deleteService = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10); 

    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de serviço inválido.' });
    }

    try {
        await prisma.servico.delete({ // CORRIGIDO: de prisma.service para prisma.servico
            where: { id },
        });
        res.status(204).send();
    } catch (error: any) {
        console.error('Erro ao deletar serviço:', error);
        if (error.code === 'P2025') { 
            return res.status(404).json({ message: 'Serviço não encontrado para exclusão.' });
        }
        if (error.code === 'P2003') {
            return res.status(409).json({ message: 'Não é possível deletar serviço com agendamentos existentes.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao deletar serviço.' });
    }
};