import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  async create(req: Request, res: Response) {
    const { name, email, phone, specialty, photo } = req.body;

    try {
      const barber = await prisma.barber.create({
        data: {
          name,
          email,
          phone,
          specialty,
          photo
        }
      });
      res.status(201).json(barber);
    } catch (error) {
      res.status(400).json({ error: "Erro ao criar barbeiro" });
    }
  },

  async read(req: Request, res: Response) {
    try {
      const barbers = await prisma.barber.findMany();
      res.json(barbers);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar barbeiros" });
    }
  },

  async readOne(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const barber = await prisma.barber.findUnique({
        where: { id: parseInt(id) },
        include: {
          appointments: {
            include: {
              service: true,
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      });

      if (!barber) {
        return res.status(404).json({ error: "Barbeiro não encontrado" });
      }

      res.json(barber);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar barbeiro" });
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, phone, specialty, photo } = req.body;

    try {
      const updatedBarber = await prisma.barber.update({
        where: { id: parseInt(id) },
        data: {
          name,
          email,
          phone,
          specialty,
          photo
        }
      });
      res.json(updatedBarber);
    } catch (error) {
      res.status(400).json({ error: "Erro ao atualizar barbeiro" });
    }
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.barber.delete({
        where: { id: parseInt(id) }
      });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Erro ao deletar barbeiro" });
    }
  },

  async getAvailability(req: Request, res: Response) {
    const { id } = req.params;
    const { date } = req.query;

    try {
      // Verifica se o barbeiro existe
      const barber = await prisma.barber.findUnique({
        where: { id: parseInt(id) }
      });

      if (!barber) {
        return res.status(404).json({ error: "Barbeiro não encontrado" });
      }

      // Busca os agendamentos do barbeiro para a data especificada
      const appointments = await prisma.appointment.findMany({
        where: {
          barberId: parseInt(id),
          date: {
            gte: new Date(date as string),
            lt: new Date(new Date(date as string).setDate(new Date(date as string).getDate() + 1))
          }
        },
        select: {
          date: true,
          service: {
            select: {
              duration: true
            }
          }
        }
      });

      // Lógica para calcular horários disponíveis
      const workStartHour = 9; // 9:00 AM
      const workEndHour = 18; // 6:00 PM
      const availableSlots = [];

      // Cria slots de 30 minutos
      for (let hour = workStartHour; hour < workEndHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(date as string);
          slotTime.setHours(hour, minute, 0, 0);

          // Verifica se o slot está disponível
          const isAvailable = !appointments.some(appointment => {
            const appointmentTime = new Date(appointment.date);
            const appointmentEndTime = new Date(appointmentTime.getTime() + appointment.service.duration * 60000);
            
            return (
              (slotTime >= appointmentTime && slotTime < appointmentEndTime) ||
              (slotTime.getTime() + 30 * 60000 > appointmentTime.getTime() && slotTime.getTime() + 30 * 60000 <= appointmentEndTime.getTime())
            );
          });

          if (isAvailable) {
            availableSlots.push({
              time: slotTime.toISOString(),
              formattedTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            });
          }
        }
      }

      res.json({
        barberId: parseInt(id),
        date,
        availableSlots
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao verificar disponibilidade" });
    }
  }
};