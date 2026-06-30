-- CreateTable
CREATE TABLE "Flotte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "siteWeb" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

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
    "flotteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chauffeur_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "Moto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Chauffeur_flotteId_fkey" FOREIGN KEY ("flotteId") REFERENCES "Flotte" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Chauffeur" ("actif", "adresse", "certificatResidenceDate", "certificatResidenceNum", "cin", "cinDateDelivrance", "cinLieuDelivrance", "codeAcces", "createdAt", "dateEmbauche", "email", "heureFinService", "heurePrisePoste", "id", "motoId", "nom", "permisCategorie", "permisDateDelivrance", "permisDateExpiration", "permisLieuDelivrance", "permisNumero", "permisStatut", "photo", "pin", "solde", "statut", "telephone", "updatedAt") SELECT "actif", "adresse", "certificatResidenceDate", "certificatResidenceNum", "cin", "cinDateDelivrance", "cinLieuDelivrance", "codeAcces", "createdAt", "dateEmbauche", "email", "heureFinService", "heurePrisePoste", "id", "motoId", "nom", "permisCategorie", "permisDateDelivrance", "permisDateExpiration", "permisLieuDelivrance", "permisNumero", "permisStatut", "photo", "pin", "solde", "statut", "telephone", "updatedAt" FROM "Chauffeur";
DROP TABLE "Chauffeur";
ALTER TABLE "new_Chauffeur" RENAME TO "Chauffeur";
CREATE UNIQUE INDEX "Chauffeur_telephone_key" ON "Chauffeur"("telephone");
CREATE UNIQUE INDEX "Chauffeur_codeAcces_key" ON "Chauffeur"("codeAcces");
CREATE UNIQUE INDEX "Chauffeur_motoId_key" ON "Chauffeur"("motoId");
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
    "flotteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Moto_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Proprietaire" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Moto_flotteId_fkey" FOREIGN KEY ("flotteId") REFERENCES "Flotte" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Moto" ("couleur", "coutDerniereVidange", "createdAt", "cylindree", "dateAchat", "dateDerniereVidange", "derniereVidangeKm", "finAssurance", "finVignette", "fournisseurVidange", "id", "immatriculation", "kmActuel", "kmProchaineVidange", "marque", "modele", "numChassis", "numMoteur", "prixAchat", "proprietaireAdresse", "proprietaireCin", "proprietaireId", "proprietaireNif", "proprietaireNom", "proprietaireNumStat", "proprietaireTelephone", "statut", "updatedAt") SELECT "couleur", "coutDerniereVidange", "createdAt", "cylindree", "dateAchat", "dateDerniereVidange", "derniereVidangeKm", "finAssurance", "finVignette", "fournisseurVidange", "id", "immatriculation", "kmActuel", "kmProchaineVidange", "marque", "modele", "numChassis", "numMoteur", "prixAchat", "proprietaireAdresse", "proprietaireCin", "proprietaireId", "proprietaireNif", "proprietaireNom", "proprietaireNumStat", "proprietaireTelephone", "statut", "updatedAt" FROM "Moto";
DROP TABLE "Moto";
ALTER TABLE "new_Moto" RENAME TO "Moto";
CREATE UNIQUE INDEX "Moto_immatriculation_key" ON "Moto"("immatriculation");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "flotteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_flotteId_fkey" FOREIGN KEY ("flotteId") REFERENCES "Flotte" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("actif", "createdAt", "email", "id", "nom", "password", "role", "updatedAt") SELECT "actif", "createdAt", "email", "id", "nom", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
