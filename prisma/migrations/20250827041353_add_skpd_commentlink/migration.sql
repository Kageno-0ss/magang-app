/*
  Warnings:

  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "File";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FileUpload" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "size" TEXT,
    "skpd" TEXT,
    "url" TEXT NOT NULL,
    "uploader" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Menunggu',
    "catatan" TEXT,
    "commentLink" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_FileUpload" ("catatan", "commentLink", "createdAt", "id", "nama", "size", "status", "uploader", "url") SELECT "catatan", "commentLink", "createdAt", "id", "nama", "size", "status", "uploader", "url" FROM "FileUpload";
DROP TABLE "FileUpload";
ALTER TABLE "new_FileUpload" RENAME TO "FileUpload";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
