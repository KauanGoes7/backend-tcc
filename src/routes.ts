import { Router, Request, Response } from "express";
import { 
  userController,
  serviceController,
  barberController,
  appointmentController,
  authController
} from "./controllers";
import { authenticate, authorize } from "./middlewares";

const routes = Router();

// Rotas públicas
routes.post("/auth/register", (req: Request, res: Response) => authController.register(req, res));
routes.post("/auth/login", (req: Request, res: Response) => authController.login(req, res));

// Rotas de usuário
routes.post("/users", 
  authenticate,
  authorize(['admin']),
  (req: Request, res: Response) => userController.create(req, res)
);

routes.get("/users", 
  authenticate,
  authorize(['admin']),
  (req: Request, res: Response) => userController.read(req, res)
);

routes.get("/users/:id", 
  authenticate,
  (req: Request, res: Response) => userController.readOne(req, res)
);

routes.put("/users/:id", 
  authenticate,
  (req: Request, res: Response) => userController.update(req, res)
);

routes.delete("/users/:id", 
  authenticate,
  authorize(['admin']),
  (req: Request, res: Response) => userController.delete(req, res)
);

// Rotas de serviços
routes.post("/services", 
  authenticate,
  authorize(['admin']),
  (req: Request, res: Response) => serviceController.create(req, res)
);

routes.get("/services", 
  (req: Request, res: Response) => serviceController.read(req, res)
);

routes.get("/services/:id", 
  (req: Request, res: Response) => serviceController.readOne(req, res)
);

routes.put("/services/:id", 
  authenticate,
  authorize(['admin']),
  (req: Request, res: Response) => serviceController.update(req, res)
);

routes.delete("/services/:id", 
  authenticate,
  authorize(['admin']),
  (req: Request, res: Response) => serviceController.delete(req, res)
);

// Rotas de barbeiros
routes.post("/barbers", 
  authenticate,
  authorize(['admin']),
  (req: Request, res: Response) => barberController.create(req, res)
);

routes.get("/barbers", 
  (req: Request, res: Response) => barberController.read(req, res)
);

routes.get("/barbers/:id", 
  (req: Request, res: Response) => barberController.readOne(req, res)
);

routes.get("/barbers/:id/availability", 
  (req: Request, res: Response) => barberController.getAvailability(req, res)
);

routes.put("/barbers/:id", 
  authenticate,
  authorize(['admin', 'barber']),
  (req: Request, res: Response) => barberController.update(req, res)
);

routes.delete("/barbers/:id", 
  authenticate,
  authorize(['admin']),
  (req: Request, res: Response) => barberController.delete(req, res)
);

// Rotas de agendamentos
routes.post("/appointments", 
  authenticate,
  (req: Request, res: Response) => appointmentController.create(req, res)
);

routes.get("/appointments", 
  authenticate,
  (req: Request, res: Response) => appointmentController.read(req, res)
);

routes.get("/appointments/:id", 
  authenticate,
  (req: Request, res: Response) => appointmentController.readOne(req, res)
);

routes.put("/appointments/:id", 
  authenticate,
  (req: Request, res: Response) => appointmentController.update(req, res)
);

routes.delete("/appointments/:id", 
  authenticate,
  (req: Request, res: Response) => appointmentController.delete(req, res)
);

// Health check
routes.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

export default routes;