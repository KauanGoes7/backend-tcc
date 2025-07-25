/*
  Warnings:

  - You are about to drop the `List` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "List";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Barbeiro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomeBarbeiro" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Servico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tema" TEXT NOT NULL,
    "nomeServico" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "servicoId" INTEGER NOT NULL,
    "barbeiroId" INTEGER NOT NULL,
    CONSTRAINT "Agendamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agendamento_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agendamento_barbeiroId_fkey" FOREIGN KEY ("barbeiroId") REFERENCES "Barbeiro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Barbeiro_nomeBarbeiro_key" ON "Barbeiro"("nomeBarbeiro");

-- CreateIndex
CREATE UNIQUE INDEX "Servico_nomeServico_key" ON "Servico"("nomeServico");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
