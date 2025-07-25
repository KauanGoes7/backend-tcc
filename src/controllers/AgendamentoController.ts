// src/controllers/AgendamentoController.ts
import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Função auxiliar para converter a string de data como na UI (ex: "seg., 28 de jul.") para um objeto Date
function parseUIDateString(dateString: string, timeString: string): Date {
    // Ex: "seg., 28 de jul."
    const parts = dateString.split(', '); // ["seg.", "28 de jul."]
    const dayAndMonth = parts[1]; // "28 de jul."
    const dayParts = dayAndMonth.split(' '); // ["28", "de", "jul."]

    const day = dayParts[0]; // "28"
    let monthNameRaw = dayParts[2]; // "jul." ou "ago."

    // Remove o ponto final e capitaliza a primeira letra para corresponder ao monthMap
    const monthName = monthNameRaw.replace('.', ''); // "jul" ou "ago"
    const normalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1); // "Jul" ou "Ago"

    const monthMap: { [key: string]: number } = {
        "Jan": 0, "Fev": 1, "Mar": 2, "Abr": 3, "Mai": 4, "Jun": 5,
        "Jul": 6, "Ago": 7, "Set": 8, "Out": 9, "Nov": 10, "Dez": 11
    };
    const month = monthMap[normalizedMonthName];

    // Adiciona uma verificação para meses não encontrados
    if (month === undefined) {
        console.error(`Erro: Mês "${normalizedMonthName}" não reconhecido na função parseUIDateString.`);
        return new Date('Invalid Date'); // Retorna uma data inválida para indicar o problema
    }

    const year = new Date().getFullYear(); // Assume o ano atual. Em um app real, você passaria o ano.

    const [hour, minute] = timeString.split(':').map(Number);

    // Cria um objeto Date usando o ano atual, mês (0-11), dia, hora e minuto
    const parsedDate = new Date(year, month, parseInt(day), hour, minute);

    // Verifica se a data resultante é válida
    if (isNaN(parsedDate.getTime())) {
        console.error("Erro: Data ou hora inválida gerada. Componentes:", { year, month, day: parseInt(day), hour, minute });
        return new Date('Invalid Date');
    }

    return parsedDate;
}


class AgendamentoController {
  // Cria um novo agendamento
  async create(req: Request, res: Response) {
    const { data: uiDateString, horario, userId, servicoId, barbeiroId } = req.body;

    if (!uiDateString || !horario || !userId || !servicoId || !barbeiroId) {
      return res.status(400).json({ error: 'Todos os campos (data, horario, userId, servicoId, barbeiroId) são obrigatórios.' });
    }

    try {
      const fullDateTime = parseUIDateString(uiDateString, horario);

      // Se parseUIDateString retornar uma data inválida, retorne um erro
      if (isNaN(fullDateTime.getTime())) {
          return res.status(400).json({ error: 'Formato de data ou hora inválido fornecido.' });
      }

      const agendamento = await prisma.agendamento.create({
        data: {
          data: fullDateTime,
          horario,
          userId,
          servicoId,
          barbeiroId,
        },
      });
      return res.status(201).json(agendamento);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          return res.status(400).json({ error: 'Um dos IDs de referência (usuário, serviço ou barbeiro) não existe.', details: error.meta });
        }
      }
      console.error("Erro ao criar agendamento:", error);
      return res.status(500).json({ error: 'Falha ao criar agendamento.', details: error.message });
    }
  }

  async read(req: Request, res: Response) {
    try {
      const agendamentos = await prisma.agendamento.findMany({
        include: { user: true, servico: true, barbeiro: true },
      });
      return res.status(200).json(agendamentos);
    } catch (error: any) {
      console.error("Erro ao ler agendamentos:", error);
      return res.status(500).json({ error: 'Falha ao recuperar agendamentos.', details: error.message });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { data: uiDateString, horario, userId, servicoId, barbeiroId } = req.body;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID de agendamento inválido.' });
    }

    let fullDateTime: Date | undefined;
    if (uiDateString && horario) {
        fullDateTime = parseUIDateString(uiDateString, horario);
        if (isNaN(fullDateTime.getTime())) { // Verifica se a data parseada é válida
            return res.status(400).json({ error: 'Formato de data ou hora inválido fornecido para atualização.' });
        }
    } else if (uiDateString || horario) { // Se apenas um for fornecido, mas não ambos
        return res.status(400).json({ error: 'Para atualizar a data ou o horário, ambos devem ser fornecidos juntos.' });
    }


    try {
      const updatedAgendamento = await prisma.agendamento.update({
        where: { id: parseInt(id) },
        data: {
          data: fullDateTime, // Será undefined se não for fornecido, e o Prisma ignora undefined
          horario,
          userId,
          servicoId,
          barbeiroId,
        },
      });
      console.log(updatedAgendamento);
      return res.status(200).json(updatedAgendamento);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: `Agendamento com ID ${id} não encontrado.`, details: error.meta });
        }
        if (error.code === 'P2003') {
          return res.status(400).json({ error: 'Um dos IDs de referência (usuário, serviço ou barbeiro) não existe para atualização.', details: error.meta });
        }
      }
      console.error("Erro ao atualizar agendamento:", error);
      return res.status(500).json({ error: 'Falha ao atualizar agendamento.', details: error.message });
    }
  }

    async delete(req: Request, res: Response) {
        const { id } = req.params;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID de agendamento inválido.' });
        }

        try {
            const deletedAgendamento = await prisma.agendamento.delete({
                where: { id: parseInt(id) },
            });
            return res.status(200).json(deletedAgendamento);
        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    return res.status(404).json({ error: `Agendamento com ID ${id} não encontrado.`, details: error.meta });
                }
            }
            console.error("Erro ao deletar agendamento:", error);
            return res.status(500).json({ error: 'Falha ao deletar agendamento.', details: error.message });
        }
    }
}

export default new AgendamentoController();