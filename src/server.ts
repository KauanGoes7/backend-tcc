import express from "express";
import cors from "cors";
import routes from "./routes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api", routes);

// Conexão com o banco de dados e inicialização do servidor
async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection error", error);
    process.exit(1);
  }
}

startServer();