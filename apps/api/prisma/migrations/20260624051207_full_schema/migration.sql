-- CreateTable
CREATE TABLE "Chauffeur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "codeAcces" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'HORS_SERVICE',
    "solde" REAL NOT NULL DEFAULT 0,
    "motoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chauffeur_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "Moto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proprietaire" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Moto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "immatriculation" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "kmActuel" REAL NOT NULL DEFAULT 0,
    "proprietaireId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Moto_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Proprietaire" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chauffeurId" TEXT NOT NULL,
    "motoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "distance" REAL,
    "prix" REAL NOT NULL,
    "commission" REAL NOT NULL,
    "gainNet" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Course_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Course_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "Moto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pointage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chauffeurId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "datePointage" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pointage_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Versement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chauffeurId" TEXT NOT NULL,
    "montantDu" REAL NOT NULL,
    "montantVerse" REAL NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Versement_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assistance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chauffeurId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "urgence" TEXT NOT NULL DEFAULT 'NORMALE',
    "description" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'OUVERT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assistance_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Depense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "categorie" TEXT NOT NULL,
    "motoId" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Depense_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "Moto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contrat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chauffeurId" TEXT NOT NULL,
    "motoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "montantLocation" REAL NOT NULL,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contrat_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contrat_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "Moto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Chauffeur_telephone_key" ON "Chauffeur"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "Chauffeur_codeAcces_key" ON "Chauffeur"("codeAcces");

-- CreateIndex
CREATE UNIQUE INDEX "Chauffeur_motoId_key" ON "Chauffeur"("motoId");

-- CreateIndex
CREATE UNIQUE INDEX "Proprietaire_telephone_key" ON "Proprietaire"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "Moto_immatriculation_key" ON "Moto"("immatriculation");
