-- CreateEnum
CREATE TYPE "LearningRole" AS ENUM ('student', 'teacher');

-- CreateEnum
CREATE TYPE "LearningWeekStatus" AS ENUM ('locked', 'in_progress', 'pending', 'completed');

-- CreateTable
CREATE TABLE "learning_accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "LearningRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_sessions" (
    "tokenHash" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_sessions_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "learning_auth_attempts" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_auth_attempts_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "learning_classes" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "studentCount" INTEGER NOT NULL,
    "plannedWeeks" INTEGER NOT NULL,
    "joinCode" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "generation" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_weeks" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "status" "LearningWeekStatus" NOT NULL DEFAULT 'locked',
    "version" INTEGER NOT NULL DEFAULT 0,
    "questionSet" JSONB,
    "answers" JSONB,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "feedback" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "learning_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_audits" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "learning_accounts_email_key" ON "learning_accounts"("email");

-- CreateIndex
CREATE INDEX "learning_sessions_accountId_idx" ON "learning_sessions"("accountId");

-- CreateIndex
CREATE INDEX "learning_sessions_expiresAt_idx" ON "learning_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "learning_auth_attempts_expiresAt_idx" ON "learning_auth_attempts"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "learning_classes_teacherId_key" ON "learning_classes"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_classes_joinCode_key" ON "learning_classes"("joinCode");

-- CreateIndex
CREATE UNIQUE INDEX "learning_enrollments_studentId_key" ON "learning_enrollments"("studentId");

-- CreateIndex
CREATE INDEX "learning_enrollments_classId_idx" ON "learning_enrollments"("classId");

-- CreateIndex
CREATE INDEX "learning_weeks_status_submittedAt_idx" ON "learning_weeks"("status", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "learning_weeks_enrollmentId_week_key" ON "learning_weeks"("enrollmentId", "week");

-- CreateIndex
CREATE INDEX "learning_audits_classId_createdAt_idx" ON "learning_audits"("classId", "createdAt");

-- AddForeignKey
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "learning_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_classes" ADD CONSTRAINT "learning_classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "learning_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_enrollments" ADD CONSTRAINT "learning_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "learning_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_enrollments" ADD CONSTRAINT "learning_enrollments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "learning_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_weeks" ADD CONSTRAINT "learning_weeks_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "learning_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

