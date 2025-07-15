// src/controllers/appointmentController.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
// Remova: import { Agendamento } from '@prisma/client'; // Não é necessário importar modelos do Prisma assim

export const createAppointment = async (req: Request, res: Response) => {
    const userId = req.user?.id; 

    const { dia, mes, ano, servicoId, barbeiroId } = req.body;

    if (userId === undefined) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const parsedServicoId = parseInt(servicoId as string, 10);
    const parsedBarbeiroId = parseInt(barbeiroId as string, 10);
    const parsedDia = parseInt(dia as string, 10);
    const parsedMes = parseInt(mes as string, 10);
    const parsedAno = parseInt(ano as string, 10);

    if (isNaN(parsedServicoId) || isNaN(parsedBarbeiroId) || isNaN(parsedDia) || isNaN(parsedMes) || isNaN(parsedAno)) {
        return res.status(400).json({ message: 'IDs ou data inválidos.' });
    }

    try {
        // CORRIGIDO: prisma.servico e prisma.barbeiro
        const serviceExists = await prisma.servico.findUnique({ where: { id: parsedServicoId } });
        const barberExists = await prisma.barbeiro.findUnique({ where: { id: parsedBarbeiroId } });

        if (!serviceExists) {
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }
        if (!barberExists) {
            return res.status(404).json({ message: 'Barbeiro não encontrado.' });
        }

        const dataAgendamento = new Date(parsedAno, parsedMes - 1, parsedDia); 
        
        const newAppointment = await prisma.agendamento.create({
            data: { // Objeto 'data' é obrigatório aqui
                data: dataAgendamento, // O nome da sua coluna no schema.prisma deve ser 'data' e do tipo DateTime
                userId: userId, // userId diretamente dentro de 'data'
                servicoId: parsedServicoId,
                barbeiroId: parsedBarbeiroId,
            },
            include: {
                servico: true,
                barbeiro: true,
            },
        });
        res.status(201).json(newAppointment);
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar agendamento.' });
    }
};

export const getUserAppointments = async (req: Request, res: Response) => {
    const userId = req.user?.id; 

    if (userId === undefined) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const appointments = await prisma.agendamento.findMany({
            where: { userId }, // userId diretamente dentro de 'where'
            include: {
                servico: true,
                barbeiro: true,
            },
            orderBy: {
                data: 'asc', // 'data' é o campo no seu schema.prisma
            },
        });
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Erro ao buscar agendamentos do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar agendamentos.' });
    }
};

export const getAppointmentById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10); 
    const userId = req.user?.id; 

    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de agendamento inválido.' });
    }
    if (userId === undefined) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const appointment = await prisma.agendamento.findUnique({
            where: { 
                id,
                userId, // userId diretamente dentro de 'where'
            },
            include: {
                servico: true,
                barbeiro: true,
            },
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a este usuário.' });
        }
        res.status(200).json(appointment);
    } catch (error) {
        console.error('Erro ao buscar agendamento por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar agendamento.' });
    }
};

export const updateAppointment = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10); 
    const userId = req.user?.id; 
    const { dia, mes, ano, servicoId, barbeiroId } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de agendamento inválido.' });
    }
    if (userId === undefined) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const dataToUpdate: any = {}; 
    if (dia && mes && ano) {
        const parsedDia = parseInt(dia as string, 10);
        const parsedMes = parseInt(mes as string, 10);
        const parsedAno = parseInt(ano as string, 10);
        if (isNaN(parsedDia) || isNaN(parsedMes) || isNaN(parsedAno)) {
            return res.status(400).json({ message: 'Data inválida para atualização.' });
        }
        dataToUpdate.data = new Date(parsedAno, parsedMes - 1, parsedDia); 
    }
    if (servicoId) {
        const parsedServicoId = parseInt(servicoId as string, 10);
        if (isNaN(parsedServicoId)) {
            return res.status(400).json({ message: 'ID do serviço inválido para atualização.' });
        }
        // CORRIGIDO: prisma.servico
        const serviceExists = await prisma.servico.findUnique({ where: { id: parsedServicoId } });
        if (!serviceExists) {
            return res.status(404).json({ message: 'Serviço não encontrado para atualização.' });
        }
        dataToUpdate.servicoId = parsedServicoId;
    }
    if (barbeiroId) {
        const parsedBarbeiroId = parseInt(barbeiroId as string, 10);
        if (isNaN(parsedBarbeiroId)) {
            return res.status(400).json({ message: 'ID do barbeiro inválido para atualização.' });
        }
        // CORRIGIDO: prisma.barbeiro
        const barberExists = await prisma.barbeiro.findUnique({ where: { id: parsedBarbeiroId } });
        if (!barberExists) {
            return res.status(404).json({ message: 'Barbeiro não encontrado para atualização.' });
        }
        dataToUpdate.barbeiroId = parsedBarbeiroId;
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
    }

    try {
        const updatedAppointment = await prisma.agendamento.update({
            where: { 
                id,
                userId, // userId diretamente dentro de 'where'
            },
            data: dataToUpdate, 
            include: {
                servico: true,
                barbeiro: true,
            },
        });
        res.status(200).json(updatedAppointment);
    } catch (error: any) {
        console.error('Erro ao atualizar agendamento:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a este usuário.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar agendamento.' });
    }
};

export const deleteAppointment = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10); 
    const userId = req.user?.id; 

    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de agendamento inválido.' });
    }
    if (userId === undefined) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        await prisma.agendamento.delete({
            where: { 
                id,
                userId, // userId diretamente dentro de 'where'
            },
        });
        res.status(204).send();
    } catch (error: any) {
        console.error('Erro ao deletar agendamento:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a este usuário.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao deletar agendamento.' });
    }
};