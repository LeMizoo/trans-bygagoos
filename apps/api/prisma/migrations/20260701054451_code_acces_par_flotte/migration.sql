/*
  Warnings:

  - A unique constraint covering the columns `[codeAcces,flotteId]` on the table `Chauffeur` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Chauffeur_codeAcces_key";

-- CreateIndex
CREATE UNIQUE INDEX "Chauffeur_codeAcces_flotteId_key" ON "Chauffeur"("codeAcces", "flotteId");
