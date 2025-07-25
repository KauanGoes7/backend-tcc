/*
  Warnings:

  - Added the required column `horario` to the `Agendamento` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agendamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "horario" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "servicoId" INTEGER NOT NULL,
    "barbeiroId" INTEGER NOT NULL,
    CONSTRAINT "Agendamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agendamento_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agendamento_barbeiroId_fkey" FOREIGN KEY ("barbeiroId") REFERENCES "Barbeiro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Agendamento" ("barbeiroId", "data", "id", "servicoId", "userId") SELECT "barbeiroId", "data", "id", "servicoId", "userId" FROM "Agendamento";
DROP TABLE "Agendamento";
ALTER TABLE "new_Agendamento" RENAME TO "Agendamento";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
