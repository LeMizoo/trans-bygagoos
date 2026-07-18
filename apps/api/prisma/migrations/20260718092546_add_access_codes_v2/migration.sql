-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "password" TEXT,
    "nom" TEXT,
    "prenom" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CHAUFFEUR',
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "codeAcces" TEXT,
    "pin" TEXT,
    "cooperativeId" TEXT,
    "flotteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_flotteId_fkey" FOREIGN KEY ("flotteId") REFERENCES "Flotte" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Flotte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cooperative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Moto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "immatriculation" TEXT NOT NULL,
    "marque" TEXT,
    "modele" TEXT,
    "annee" INTEGER,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "flotteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Moto_flotteId_fkey" FOREIGN KEY ("flotteId") REFERENCES "Flotte" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vehicule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "immatriculation" TEXT NOT NULL,
    "marque" TEXT,
    "modele" TEXT,
    "annee" INTEGER,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "cooperativeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vehicule_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "depart" TEXT NOT NULL,
    "arrivee" TEXT NOT NULL,
    "prix" REAL NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "userId" TEXT NOT NULL,
    "motoId" TEXT,
    "dateCourse" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Course_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "Moto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "description" TEXT,
    "prix" REAL NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "userId" TEXT NOT NULL,
    "vehiculeId" TEXT,
    "dateLivraison" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Commande_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Commande_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pointage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "localisation" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pointage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Depense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "justificatif" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Depense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Versement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "montant" REAL NOT NULL,
    "mode" TEXT NOT NULL,
    "reference" TEXT,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Versement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assistance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "reponse" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assistance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parametre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Abonnement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "debut" DATETIME NOT NULL,
    "fin" DATETIME,
    "flotteId" TEXT,
    "cooperativeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_codeAcces_key" ON "User"("codeAcces");

-- CreateIndex
CREATE UNIQUE INDEX "Flotte_code_key" ON "Flotte"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Cooperative_code_key" ON "Cooperative"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Moto_immatriculation_key" ON "Moto"("immatriculation");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_immatriculation_key" ON "Vehicule"("immatriculation");

-- CreateIndex
CREATE UNIQUE INDEX "Commande_reference_key" ON "Commande"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Parametre_cle_key" ON "Parametre"("cle");
