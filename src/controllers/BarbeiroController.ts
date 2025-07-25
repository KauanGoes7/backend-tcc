// src/controllers/BarbeiroController.ts
import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client"; // Caminho corrigido para o Prisma Client

const prisma = new PrismaClient(); // Instancia o Prisma Client

export default {
    // Cria um novo barbeiro
    create: async (req: Request, res: Response) => {
        const barbeiro = await prisma.barbeiro.create({ data: req.body });
        return res.status(201).json(barbeiro);
    },

    // Lista todos os barbeiros
    read: async (req: Request, res: Response) => {
        const barbeiros = await prisma.barbeiro.findMany();
        return res.status(200).json(barbeiros);
    },

    // Atualiza um barbeiro existente
    update: async (req: Request, res: Response) => {
        const id = req.params.id;
        const barbeiro = await prisma.barbeiro.update({ data: req.body, where: { id: +id } });
        console.log(barbeiro); // Mantém o console.log como nos outros controllers
        return res.status(200).json(barbeiro);
    },

    // Deleta um barbeiro
    delete: async (req: Request, res: Response) => {
        const id = req.params.id;
        const barbeiro = await prisma.barbeiro.delete({ where: { id: +id } });
        return res.status(200).json(barbeiro); // Retorna o barbeiro deletado
    },
};