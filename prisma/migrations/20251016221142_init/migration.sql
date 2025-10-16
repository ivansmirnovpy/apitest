-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "client_id" TEXT NOT NULL,
    "hashed_client_secret" TEXT NOT NULL,
    "backend_url" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_tenants_client_id" ON "tenants"("client_id");
