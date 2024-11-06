-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "run_on" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails" (
    "dbId" SERIAL NOT NULL,
    "id" VARCHAR(255) NOT NULL,
    "threadId" VARCHAR(255) NOT NULL,
    "labelIds" VARCHAR(255) NOT NULL,
    "snippet" VARCHAR(255) NOT NULL,
    "historyId" VARCHAR(255) NOT NULL,
    "internalDate" BIGINT NOT NULL,
    "sizeEstimate" INTEGER NOT NULL,
    "raw" BYTEA NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("dbId")
);
