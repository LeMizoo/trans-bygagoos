-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chauffeur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "codeAcces" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'HORS_SERVICE',
    "solde" REAL NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "motoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chauffeur_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "Moto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Chauffeur" ("codeAcces", "createdAt", "id", "motoId", "nom", "pin", "solde", "statut", "telephone", "updatedAt") SELECT "codeAcces", "createdAt", "id", "motoId", "nom", "pin", "solde", "statut", "telephone", "updatedAt" FROM "Chauffeur";
DROP TABLE "Chauffeur";
ALTER TABLE "new_Chauffeur" RENAME TO "Chauffeur";
CREATE UNIQUE INDEX "Chauffeur_telephone_key" ON "Chauffeur"("telephone");
CREATE UNIQUE INDEX "Chauffeur_codeAcces_key" ON "Chauffeur"("codeAcces");
CREATE UNIQUE INDEX "Chauffeur_motoId_key" ON "Chauffeur"("motoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
