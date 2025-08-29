/*
  Warnings:

  - You are about to drop the column `size` on the `File` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "skpd" TEXT,
    "uploader" TEXT NOT NULL,
    "status" TEXT,
    "catatan" TEXT,
    "commentLink" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_File" ("catatan", "createdAt", "id", "nama", "status", "uploader", "url") SELECT "catatan", "createdAt", "id", "nama", "status", "uploader", "url" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
