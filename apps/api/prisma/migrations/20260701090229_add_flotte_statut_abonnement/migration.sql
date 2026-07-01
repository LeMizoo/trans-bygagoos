-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Flotte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "siteWeb" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "abonnement" TEXT NOT NULL DEFAULT 'GRATUIT',
    "dateValidation" DATETIME,
    "dateFinAbonnement" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Flotte" ("adresse", "createdAt", "description", "email", "id", "logo", "nom", "siteWeb", "telephone", "updatedAt") SELECT "adresse", "createdAt", "description", "email", "id", "logo", "nom", "siteWeb", "telephone", "updatedAt" FROM "Flotte";
DROP TABLE "Flotte";
ALTER TABLE "new_Flotte" RENAME TO "Flotte";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
