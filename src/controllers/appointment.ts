import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  async create(req: Request, res: Response) {
    const { date, clientId, barberId, serviceId } = req.body;

    try {
      // Verifica se o cliente, barbeiro e serviço existem
      const [client, barber, service] = await Promise.all([
        prisma.user.findUnique({ where: { id: parseInt(clientId) } }),
        prisma.barber.findUnique({ where: { id: parseInt(barberId) } }),
        prisma.service.findUnique({ where: { id: parseInt(serviceId) } })
      ]);

      if (!client) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
      if (!barber) {
        return res.status(404).json({ error: "Barbeiro não encontrado" });
      }
      if (!service) {
        return res.status(404).json({ error: "Serviço não encontrado" });
      }

      // Verifica conflitos de horário
      const conflictingAppointments = await prisma.appointment.findMany({
        where: {
          barberId: parseInt(barberId),
          date: {
            gte: new Date(new Date(date).getTime() - service.duration * 60000),
            lt: new Date(new Date(date).getTime() + service.duration * 60000)
          }
        }
      });

      if (conflictingAppointments.length > 0) {
        return res.status(400).json({ error: "Conflito de horário com outro agendamento" });
      }

      const appointment = await prisma.appointment.create({
        data: {
          date: new Date(date),
          clientId: parseInt(clientId),
          barberId: parseInt(barberId),
          serviceId: parseInt(serviceId),
          status: "confirmed"
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          barber: true,
          service: true
        }
      });

      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ error: "Erro ao criar agendamento" });
    }
  },

  async read(req: Request, res: Response) {
    try {
      const appointments = await prisma.appointment.findMany({
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          barber: true,
          service: true
        },
        orderBy: {
          date: 'asc'
        }
      });
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar agendamentos" });
    }
  },

  async readOne(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          barber: true,
          service: true
        }
      });

      if (!appointment) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar agendamento" });
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { date, status, barberId, serviceId } = req.body;

    try {
      const updatedAppointment = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: {
          date: date ? new Date(date) : undefined,
          status,
          barberId: barberId ? parseInt(barberId) : undefined,
          serviceId: serviceId ? parseInt(serviceId) : undefined
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          barber: true,
          service: true
        }
      });
      res.json(updatedAppointment);
    } catch (error) {
      res.status(400).json({ error: "Erro ao atualizar agendamento" });
    }
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.appointment.delete({
        where: { id: parseInt(id) }
      });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Erro ao deletar agendamento" });
    }
  }
};