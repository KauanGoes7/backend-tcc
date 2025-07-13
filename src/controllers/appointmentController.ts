// src/controllers/appointmentController.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Appointment } from '@prisma/client'; // Importa o tipo Appointment do Prisma Client

// Função auxiliar para validar se a data está dentro de 1 mês
const isWithinOneMonth = (dia: number, mes: number): boolean => {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1; // getMonth() retorna 0-11
    const todayYear = today.getFullYear();

    const appointmentDate = new Date(todayYear, mes - 1, dia); // mês é 0-indexado para Date()

    // Se o agendamento for para um ano futuro, ou se o mês for mais de um mês à frente
    // Ajustar o ano do agendamento se o mês for anterior ao atual (mas em um ciclo de agendamento válido)
    if (mes < todayMonth) {
        appointmentDate.setFullYear(todayYear + 1);
    }
    
    // Calcula a data limite (1 mês a partir de hoje)
    const oneMonthFromNow = new Date(todayYear, todayMonth, todayDay); // Usa o mês atual para evitar problemas de "data inexistente" (ex: Jan 31 + 1 mês não é Fev 31)
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    
    // Zera horas, minutos, segundos e milissegundos para comparação precisa de datas
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    oneMonthFromNow.setHours(0, 0, 0, 0);


    // O agendamento deve ser no futuro ou hoje, e dentro do limite de 1 mês
    return appointmentDate >= today && appointmentDate <= oneMonthFromNow;
};


// @desc    Criar um novo agendamento
// @route   POST /api/appointments
// @access  Private (requer autenticação do usuário)
export const createAppointment = async (req: Request, res: Response) => {
    const { dia, mes, servicoId, barbeiroId } = req.body;
    const userId = req.user?.id; // Obtém o ID do usuário autenticado do req.user

    if (!userId || !dia || !mes || !servicoId || !barbeiroId) {
        return res.status(400).json({ message: 'Todos os campos (dia, mês, serviço, barbeiro) são obrigatórios.' });
    }

    // Validação da data
    if (!isWithinOneMonth(dia, mes)) {
        return res.status(400).json({ message: 'Agendamentos depois de 1 mês somente pelo WhatsApp.' });
    }
    
    // Validação de dia e mês básicos (poderia ser mais robusta, ex: dias por mês)
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12) {
        return res.status(400).json({ message: 'Dia ou mês inválido.' });
    }

    try {
        // Verificar se o usuário, serviço e barbeiro existem
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        const serviceExists = await prisma.service.findUnique({ where: { id: servicoId } });
        const barberExists = await prisma.barber.findUnique({ where: { id: barbeiroId } });

        if (!userExists) return res.status(404).json({ message: 'Usuário não encontrado.' });
        if (!serviceExists) return res.status(404).json({ message: 'Serviço não encontrado.' });
        if (!barberExists) return res.status(404).json({ message: 'Barbeiro não encontrado.' });

        // Opcional: Verificar disponibilidade do barbeiro para a data e hora (se tivesse hora)
        // Por exemplo, você pode querer adicionar um campo 'hora' ao agendamento para evitar conflitos de horário.
        // Se um barbeiro só puder ter 1 agendamento por dia, você poderia verificar:
        const existingAppointment = await prisma.appointment.findFirst({
             where: {
                 barbeiroId: barbeiroId,
                 dia: dia,
                 mes: mes
             }
        });

        if (existingAppointment) {
            return res.status(409).json({ message: 'Já existe um agendamento para este barbeiro neste dia e mês. Por favor, escolha outra data.' });
        }


        const appointment = await prisma.appointment.create({
            data: {
                dia,
                mes,
                usuarioId: userId,
                servicoId: servicoId,
                barbeiroId: barbeiroId
            },
            include: { // Inclui os detalhes relacionados no retorno
                usuario: { select: { nome: true, email: true } },
                servico: { select: { nomeServico: true, tema: true } },
                barbeiro: { select: { nomeBarbeiro: true } }
            }
        });
        res.status(201).json(appointment);

    } catch (error: any) {
        console.error("Erro ao criar agendamento:", error);
        res.status(500).json({ message: 'Erro ao criar agendamento.', error: error.message });
    }
};

// @desc    Listar agendamentos do usuário logado
// @route   GET /api/appointments
// @access  Private
export const getMyAppointments = async (req: Request, res: Response) => {
    const userId = req.user?.id; // Obtém o ID do usuário autenticado

    if (!userId) {
        return res.status(401).json({ message: 'Não autorizado. ID do usuário ausente.' });
    }

    try {
        const appointments = await prisma.appointment.findMany({
            where: { usuarioId: userId },
            include: {
                usuario: { select: { nome: true, email: true } },
                servico: { select: { nomeServico: true, tema: true } },
                barbeiro: { select: { nomeBarbeiro: true } }
            },
            orderBy: [{ mes: 'asc' }, { dia: 'asc' }]
        });
        res.status(200).json(appointments);
    } catch (error: any) {
        console.error("Erro ao listar agendamentos:", error);
        res.status(500).json({ message: 'Erro ao listar agendamentos.', error: error.message });
    }
};

// @desc    Obter um agendamento específico por ID (para o usuário logado)
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Não autorizado. ID do usuário ausente.' });
    }

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: id },
            include: {
                usuario: { select: { nome: true, email: true } },
                servico: { select: { nomeServico: true, tema: true } },
                barbeiro: { select: { nomeBarbeiro: true } }
            }
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Agendamento não encontrado.' });
        }

        // Garante que o agendamento pertence ao usuário logado
        if (appointment.usuarioId !== userId) {
            return res.status(403).json({ message: 'Acesso negado. Este agendamento não pertence a você.' });
        }

        res.status(200).json(appointment);
    } catch (error: any) {
        console.error("Erro ao obter agendamento por ID:", error);
        res.status(500).json({ message: 'Erro ao obter agendamento.', error: error.message });
    }
};

// @desc    Atualizar um agendamento
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { dia, mes, servicoId, barbeiroId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Não autorizado. ID do usuário ausente.' });
    }

    if (!dia && !mes && !servicoId && !barbeiroId) {
        return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
    }

    try {
        const existingAppointment = await prisma.appointment.findUnique({ where: { id: id } });

        if (!existingAppointment) {
            return res.status(404).json({ message: 'Agendamento não encontrado.' });
        }
        
        // Garante que apenas o proprietário pode atualizar o agendamento
        if (existingAppointment.usuarioId !== userId) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para atualizar este agendamento.' });
        }

        // Validação da nova data, se fornecida
        if (dia !== undefined || mes !== undefined) {
            const updatedDia = dia !== undefined ? dia : existingAppointment.dia;
            const updatedMes = mes !== undefined ? mes : existingAppointment.mes;

            if (!isWithinOneMonth(updatedDia, updatedMes)) {
                return res.status(400).json({ message: 'Agendamentos depois de 1 mês somente pelo WhatsApp.' });
            }
            if (updatedDia < 1 || updatedDia > 31 || updatedMes < 1 || updatedMes > 12) {
                return res.status(400).json({ message: 'Dia ou mês inválido na atualização.' });
            }
        }

        // Opcional: Verificar existência dos novos serviço/barbeiro se forem atualizados
        if (servicoId) {
            const serviceExists = await prisma.service.findUnique({ where: { id: servicoId } });
            if (!serviceExists) return res.status(404).json({ message: 'Novo serviço não encontrado.' });
        }
        if (barbeiroId) {
            const barberExists = await prisma.barber.findUnique({ where: { id: barbeiroId } });
            if (!barberExists) return res.status(404).json({ message: 'Novo barbeiro não encontrado.' });
        }
        
        // Opcional: Verificar disponibilidade para a nova data/hora/barbeiro
        // Se a data, mês ou barbeiro forem alterados, re-verifique a disponibilidade
        if ((dia !== undefined && dia !== existingAppointment.dia) ||
            (mes !== undefined && mes !== existingAppointment.mes) ||
            (barbeiroId !== undefined && barbeiroId !== existingAppointment.barbeiroId)) {
            
            const targetDia = dia !== undefined ? dia : existingAppointment.dia;
            const targetMes = mes !== undefined ? mes : existingAppointment.dia;
            const targetBarberId = barbeiroId !== undefined ? barbeiroId : existingAppointment.barbeiroId;

            const conflictAppointment = await prisma.appointment.findFirst({
                where: {
                    barbeiroId: targetBarberId,
                    dia: targetDia,
                    mes: targetMes,
                    NOT: { id: existingAppointment.id } // Exclui o próprio agendamento que está sendo atualizado
                }
            });

            if (conflictAppointment) {
                return res.status(409).json({ message: 'Já existe um agendamento para este barbeiro nesta nova data. Por favor, escolha outra.' });
            }
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id: id },
            data: {
                dia,
                mes,
                servicoId,
                barbeiroId
            },
            include: {
                usuario: { select: { nome: true, email: true } },
                servico: { select: { nomeServico: true, tema: true } },
                barbeiro: { select: { nomeBarbeiro: true } }
            }
        });
        res.status(200).json(updatedAppointment);

    } catch (error: any) {
        if (error.code === 'P2025' || error.message.includes('No Appointment found')) {
            return res.status(404).json({ message: 'Agendamento não encontrado para atualização.' });
        }
        console.error("Erro ao atualizar agendamento:", error);
        res.status(500).json({ message: 'Erro ao atualizar agendamento.', error: error.message });
    }
};

// @desc    Deletar um agendamento
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Não autorizado. ID do usuário ausente.' });
    }

    try {
        const existingAppointment = await prisma.appointment.findUnique({ where: { id: id } });

        if (!existingAppointment) {
            return res.status(404).json({ message: 'Agendamento não encontrado.' });
        }

        // Garante que apenas o proprietário pode deletar o agendamento
        if (existingAppointment.usuarioId !== userId) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para deletar este agendamento.' });
        }

        await prisma.appointment.delete({
            where: { id: id },
        });
        res.status(200).json({ message: 'Agendamento deletado com sucesso.' });
    } catch (error: any) {
        if (error.code === 'P2025' || error.message.includes('No Appointment found')) {
            return res.status(404).json({ message: 'Agendamento não encontrado para exclusão.' });
        }
        console.error("Erro ao deletar agendamento:", error);
        res.status(500).json({ message: 'Erro ao deletar agendamento.', error: error.message });
    }
};