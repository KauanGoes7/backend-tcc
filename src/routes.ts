import { Router, Request, Response } from "express";
import UserController from "./controllers/UserController";
import BarbeiroController from "./controllers/BarbeiroController";
import ServicoController from "./controllers/ServicoController";
import AgendamentoController from "./controllers/AgendamentoController";

const routes = Router();

// Rotas do User
routes.post("/users", (req: Request, res: Response) : any => UserController.create(req, res));
routes.get("/users", (req: Request, res: Response) : any => UserController.read(req, res));
routes.put("/users/:id", (req: Request, res: Response) : any => UserController.update(req, res));
routes.delete("/users/:id", (req: Request, res: Response) : any => UserController.delete(req, res));
routes.post("/login", (req: Request, res: Response) : any => UserController.login(req, res)); 

// Rotas do Barbeiro
routes.post("/barbeiros", (req: Request, res: Response) : any => BarbeiroController.create(req, res));
routes.get("/barbeiros", (req: Request, res: Response) : any => BarbeiroController.read(req, res));
routes.put("/barbeiros/:id", (req: Request, res: Response) : any => BarbeiroController.update(req, res));
routes.delete("/barbeiros/:id", (req: Request, res: Response) : any => BarbeiroController.delete(req, res));

// Rotas do Servico
routes.post("/servicos", (req: Request, res: Response) : any => ServicoController.create(req, res));
routes.get("/servicos", (req: Request, res: Response) : any => ServicoController.read(req, res));
routes.put("/servicos/:id", (req: Request, res: Response) : any => ServicoController.update(req, res));
routes.delete("/servicos/:id", (req: Request, res: Response) : any => ServicoController.delete(req, res));

// Rotas do Agendamento
routes.post("/agendamentos", (req: Request, res: Response) : any => AgendamentoController.create(req, res));
routes.get("/agendamentos", (req: Request, res: Response) : any => AgendamentoController.read(req, res));
routes.put("/agendamentos/:id", (req: Request, res: Response) : any => AgendamentoController.update(req, res));
routes.delete("/agendamentos/:id", (req: Request, res: Response) : any => AgendamentoController.delete(req, res));

export default routes;