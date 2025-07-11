import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default {
  async create(req: Request, res: Response) {
    const { name, email, password, phone, role = "client" } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role
        }
      });

      // Não retornar a senha
      const { password: _, ...userData } = user;
      res.status(201).json(userData);
    } catch (error) {
      res.status(400).json({ error: "Erro ao criar usuário" });
    }
  },

  async read(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true
        }
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  },

  async readOne(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { name, email, phone, role },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true
        }
      });

      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: "Erro ao atualizar usuário" });
    }
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.user.delete({
        where: { id: parseInt(id) }
      });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Erro ao deletar usuário" });
    }
  }
};