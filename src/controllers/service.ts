import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  async create(req: Request, res: Response) {
    const { name, description, price, duration } = req.body;

    try {
      const service = await prisma.service.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          duration: parseInt(duration)
        }
      });
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ error: "Erro ao criar serviço" });
    }
  },

  async read(req: Request, res: Response) {
    try {
      const services = await prisma.service.findMany();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar serviços" });
    }
  },

  async readOne(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const service = await prisma.service.findUnique({
        where: { id: parseInt(id) }
      });

      if (!service) {
        return res.status(404).json({ error: "Serviço não encontrado" });
      }

      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar serviço" });
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description, price, duration } = req.body;

    try {
      const updatedService = await prisma.service.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
          price: parseFloat(price),
          duration: parseInt(duration)
        }
      });
      res.json(updatedService);
    } catch (error) {
      res.status(400).json({ error: "Erro ao atualizar serviço" });
    }
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.service.delete({
        where: { id: parseInt(id) }
      });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Erro ao deletar serviço" });
    }
  }
};