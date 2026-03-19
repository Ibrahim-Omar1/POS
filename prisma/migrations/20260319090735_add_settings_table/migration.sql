-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "storeName" TEXT NOT NULL DEFAULT 'My POS Store',
    "storePhone" TEXT NOT NULL DEFAULT '',
    "storeAddress" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "updatedAt" DATETIME NOT NULL
);
