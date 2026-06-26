-- AlterTable
ALTER TABLE "Chauffeur" ADD COLUMN "adresse" TEXT;
ALTER TABLE "Chauffeur" ADD COLUMN "certificatResidenceDate" DATETIME;
ALTER TABLE "Chauffeur" ADD COLUMN "certificatResidenceNum" TEXT;
ALTER TABLE "Chauffeur" ADD COLUMN "cin" TEXT;
ALTER TABLE "Chauffeur" ADD COLUMN "cinDateDelivrance" DATETIME;
ALTER TABLE "Chauffeur" ADD COLUMN "cinLieuDelivrance" TEXT;
ALTER TABLE "Chauffeur" ADD COLUMN "dateEmbauche" DATETIME;
ALTER TABLE "Chauffeur" ADD COLUMN "email" TEXT;
ALTER TABLE "Chauffeur" ADD COLUMN "heureFinService" TEXT;
ALTER TABLE "Chauffeur" ADD COLUMN "heurePrisePoste" TEXT;
ALTER TABLE "Chauffeur" ADD COLUMN "permisCategorie" TEXT;
ALTER TABLE "Chauffeur" ADD COLUMN "permisDateDelivrance" DATETIME;
ALTER TABLE "Chauffeur" ADD COLUMN "permisDateExpiration" DATETIME;
ALTER TABLE "Chauffeur" ADD COLUMN "permisLieuDelivrance" TEXT;
ALTER TABLE "Chauffeur" ADD COLUMN "permisNumero" TEXT;
ALTER TABLE "Chauffeur" ADD COLUMN "permisStatut" TEXT;
ALTER TABLE "Chauffeur" ADD COLUMN "photo" TEXT;

-- CreateTable
CREATE TABLE "Parametre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Moto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "immatriculation" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "cylindree" TEXT,
    "numMoteur" TEXT,
    "numChassis" TEXT,
    "couleur" TEXT,
    "kmActuel" REAL NOT NULL DEFAULT 0,
    "prixAchat" REAL,
    "dateAchat" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'disponible',
    "proprietaireId" TEXT,
    "proprietaireNom" TEXT,
    "proprietaireCin" TEXT,
    "proprietaireTelephone" TEXT,
    "proprietaireAdresse" TEXT,
    "proprietaireNif" TEXT,
    "proprietaireNumStat" TEXT,
    "kmProchaineVidange" REAL,
    "dateDerniereVidange" DATETIME,
    "derniereVidangeKm" REAL,
    "coutDerniereVidange" REAL,
    "fournisseurVidange" TEXT,
    "finAssurance" DATETIME,
    "finVignette" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Moto_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Proprietaire" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Moto" ("createdAt", "id", "immatriculation", "kmActuel", "marque", "modele", "proprietaireId", "updatedAt") SELECT "createdAt", "id", "immatriculation", "kmActuel", "marque", "modele", "proprietaireId", "updatedAt" FROM "Moto";
DROP TABLE "Moto";
ALTER TABLE "new_Moto" RENAME TO "Moto";
CREATE UNIQUE INDEX "Moto_immatriculation_key" ON "Moto"("immatriculation");
CREATE TABLE "new_Proprietaire" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "cin" TEXT,
    "adresse" TEXT,
    "nif" TEXT,
    "numStat" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Proprietaire" ("createdAt", "email", "id", "nom", "telephone", "updatedAt") SELECT "createdAt", "email", "id", "nom", "telephone", "updatedAt" FROM "Proprietaire";
DROP TABLE "Proprietaire";
ALTER TABLE "new_Proprietaire" RENAME TO "Proprietaire";
CREATE UNIQUE INDEX "Proprietaire_telephone_key" ON "Proprietaire"("telephone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Parametre_nom_key" ON "Parametre"("nom");
