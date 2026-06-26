-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chauffeur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "codeAcces" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'HORS_SERVICE',
    "solde" REAL NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "cin" TEXT,
    "cinDateDelivrance" DATETIME,
    "cinLieuDelivrance" TEXT,
    "permisNumero" TEXT,
    "permisCategorie" TEXT,
    "permisDateDelivrance" DATETIME,
    "permisDateExpiration" DATETIME,
    "permisLieuDelivrance" TEXT,
    "permisStatut" TEXT,
    "adresse" TEXT,
    "certificatResidenceNum" TEXT,
    "certificatResidenceDate" DATETIME,
    "dateEmbauche" DATETIME,
    "photo" TEXT,
    "heurePrisePoste" TEXT NOT NULL DEFAULT '07:00',
    "heureFinService" TEXT NOT NULL DEFAULT '19:00',
    "motoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chauffeur_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "Moto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Chauffeur" ("actif", "adresse", "certificatResidenceDate", "certificatResidenceNum", "cin", "cinDateDelivrance", "cinLieuDelivrance", "codeAcces", "createdAt", "dateEmbauche", "email", "heureFinService", "heurePrisePoste", "id", "motoId", "nom", "permisCategorie", "permisDateDelivrance", "permisDateExpiration", "permisLieuDelivrance", "permisNumero", "permisStatut", "photo", "pin", "solde", "statut", "telephone", "updatedAt") SELECT "actif", "adresse", "certificatResidenceDate", "certificatResidenceNum", "cin", "cinDateDelivrance", "cinLieuDelivrance", "codeAcces", "createdAt", "dateEmbauche", "email", coalesce("heureFinService", '19:00') AS "heureFinService", coalesce("heurePrisePoste", '07:00') AS "heurePrisePoste", "id", "motoId", "nom", "permisCategorie", "permisDateDelivrance", "permisDateExpiration", "permisLieuDelivrance", "permisNumero", "permisStatut", "photo", "pin", "solde", "statut", "telephone", "updatedAt" FROM "Chauffeur";
DROP TABLE "Chauffeur";
ALTER TABLE "new_Chauffeur" RENAME TO "Chauffeur";
CREATE UNIQUE INDEX "Chauffeur_telephone_key" ON "Chauffeur"("telephone");
CREATE UNIQUE INDEX "Chauffeur_codeAcces_key" ON "Chauffeur"("codeAcces");
CREATE UNIQUE INDEX "Chauffeur_motoId_key" ON "Chauffeur"("motoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
