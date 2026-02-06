-- CreateEnum
CREATE TYPE "Position" AS ENUM ('SETTER', 'OUTSIDE', 'OPPOSITE', 'MIDDLE', 'LIBERO');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('SERVE', 'RECEIVE', 'ATTACK', 'BLOCK', 'DIG', 'SET');

-- CreateEnum
CREATE TYPE "ActionResult" AS ENUM ('ERROR', 'NEGATIVE', 'NEUTRAL', 'POSITIVE', 'POINT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "position" "Position" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "opponent" TEXT NOT NULL,
    "location" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "currentSet" INTEGER NOT NULL DEFAULT 1,
    "scoreHome" INTEGER NOT NULL DEFAULT 0,
    "scoreAway" INTEGER NOT NULL DEFAULT 0,
    "setsHome" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "setsAway" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT,
    "type" "ActionType" NOT NULL,
    "result" "ActionResult" NOT NULL,
    "set" INTEGER NOT NULL DEFAULT 1,
    "isOpponentPoint" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Team_userId_idx" ON "Team"("userId");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- CreateIndex
CREATE INDEX "Player_teamId_isActive_idx" ON "Player"("teamId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Player_teamId_number_key" ON "Player"("teamId", "number");

-- CreateIndex
CREATE INDEX "Match_teamId_idx" ON "Match"("teamId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_teamId_status_idx" ON "Match"("teamId", "status");

-- CreateIndex
CREATE INDEX "Action_matchId_idx" ON "Action"("matchId");

-- CreateIndex
CREATE INDEX "Action_playerId_idx" ON "Action"("playerId");

-- CreateIndex
CREATE INDEX "Action_matchId_set_idx" ON "Action"("matchId", "set");

-- CreateIndex
CREATE INDEX "Action_matchId_playerId_idx" ON "Action"("matchId", "playerId");

-- CreateIndex
CREATE INDEX "Action_matchId_type_idx" ON "Action"("matchId", "type");

-- CreateIndex
CREATE INDEX "Action_matchId_set_type_idx" ON "Action"("matchId", "set", "type");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
