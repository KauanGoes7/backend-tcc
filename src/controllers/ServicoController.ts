// src/controllers/ServicoController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client"; // Caminho corrigido para o Prisma Client

const prisma = new PrismaClient(); // Instancia o Prisma Client

export default {
    // Cria um novo serviço
    create: async (req: Request, res: Response) => {
        const servico = await prisma.servico.create({ data: req.body });
        return res.status(201).json(servico);
    },

    // Lista todos os serviços
    read: async (req: Request, res: Response) => {
        // Para o modelo Servico, não temos um campo 'password' para excluir,
        // então findMany() direto já retorna todos os campos.
        const servicos = await prisma.servico.findMany();
        return res.status(200).json(servicos);
    },

    // Atualiza um serviço existente
    update: async (req: Request, res: Response) => {
        const id = req.params.id;
        const servico = await prisma.servico.update({ data: req.body, where: { id: +id } });
        console.log(servico); // Mantém o console.log como no UserController
        return res.status(200).json(servico);
    },

    // Deleta um serviço
    delete: async (req: Request, res: Response) => {
        const id = req.params.id;
        const servico = await prisma.servico.delete({ where: { id: +id } });
        return res.status(200).json(servico); // Retorna o serviço deletado, como no UserController
    },
};