-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('ADMIN', 'CHIEF', 'SECRETARY', 'INSPECTOR', 'APPLICANT');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INDENTURE', 'FORMER_ALLOCATION', 'SITE_PLAN', 'ID_CARD');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PROCESSING_FEE', 'INSPECTION_FEE', 'DRINKS_MONEY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('USED', 'UNUSED', 'EXPIRED', 'INACTIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "ROLE" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payableService" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "payableService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "clientReference" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT NOT NULL,
    "paymentProvider" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "isPaymentCompleted" BOOLEAN NOT NULL,
    "isServiceCompleted" BOOLEAN NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "uniqueFormID" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "applicantDOB" TIMESTAMP(3)[],
    "mailingAddress" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "placeOfResidence" TEXT NOT NULL,
    "hometown" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "nextOfKin" TEXT NOT NULL,
    "landLocality" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "plotNumbers" TEXT NOT NULL,
    "totalLandSize" TEXT NOT NULL,
    "streetName" TEXT NOT NULL,
    "landTransferor" TEXT NOT NULL,
    "dateOfOriginalTransfer" TIMESTAMP(3) NOT NULL,
    "purposeOfLand" TEXT NOT NULL,
    "contactOfTransferor" TEXT,
    "status" "ApplicationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "formStatus" "FormStatus" NOT NULL DEFAULT 'INACTIVE',

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationForm" (
    "id" SERIAL NOT NULL,
    "uniqueFormID" TEXT NOT NULL,
    "organisationName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "mailingAddress" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "organizationLogo" TEXT NOT NULL,
    "landLocality" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "plotNumbers" TEXT NOT NULL,
    "totalLandSize" TEXT NOT NULL,
    "streetName" TEXT NOT NULL,
    "landTransferor" TEXT NOT NULL,
    "dateOfOriginalTransfer" TIMESTAMP(3) NOT NULL,
    "purposeOfLand" TEXT NOT NULL,
    "contactOfTransferor" TEXT,
    "status" "ApplicationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "formStatus" "FormStatus" NOT NULL DEFAULT 'INACTIVE',

    CONSTRAINT "OrganizationForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgPayment" (
    "id" SERIAL NOT NULL,
    "organizationFormId" INTEGER NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,

    CONSTRAINT "OrgPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "type" "DocumentType" NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orgDocument" (
    "id" SERIAL NOT NULL,
    "type" "DocumentType" NOT NULL,
    "image" TEXT NOT NULL,
    "organizationFormId" INTEGER NOT NULL,

    CONSTRAINT "orgDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "FormStatus" NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Secretary" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "secretaryId" TEXT NOT NULL,

    CONSTRAINT "Secretary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspector" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,

    CONSTRAINT "Inspector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "uniqueFormId" TEXT NOT NULL,
    "secretaryId" TEXT NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chief" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "chiefId" TEXT NOT NULL,

    CONSTRAINT "Chief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_InspectorToInvitation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "payableService_code_key" ON "payableService"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_clientReference_key" ON "Transaction"("clientReference");

-- CreateIndex
CREATE UNIQUE INDEX "Application_uniqueFormID_key" ON "Application"("uniqueFormID");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationForm_uniqueFormID_key" ON "OrganizationForm"("uniqueFormID");

-- CreateIndex
CREATE UNIQUE INDEX "Secretary_email_key" ON "Secretary"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Secretary_secretaryId_key" ON "Secretary"("secretaryId");

-- CreateIndex
CREATE UNIQUE INDEX "Inspector_email_key" ON "Inspector"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Inspector_inspectorId_key" ON "Inspector"("inspectorId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_uniqueFormId_key" ON "Assignment"("uniqueFormId");

-- CreateIndex
CREATE UNIQUE INDEX "Chief_email_key" ON "Chief"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Chief_chiefId_key" ON "Chief"("chiefId");

-- CreateIndex
CREATE UNIQUE INDEX "_InspectorToInvitation_AB_unique" ON "_InspectorToInvitation"("A", "B");

-- CreateIndex
CREATE INDEX "_InspectorToInvitation_B_index" ON "_InspectorToInvitation"("B");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationForm" ADD CONSTRAINT "OrganizationForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPayment" ADD CONSTRAINT "OrgPayment_organizationFormId_fkey" FOREIGN KEY ("organizationFormId") REFERENCES "OrganizationForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orgDocument" ADD CONSTRAINT "orgDocument_organizationFormId_fkey" FOREIGN KEY ("organizationFormId") REFERENCES "OrganizationForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_secretaryId_fkey" FOREIGN KEY ("secretaryId") REFERENCES "Secretary"("secretaryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InspectorToInvitation" ADD CONSTRAINT "_InspectorToInvitation_A_fkey" FOREIGN KEY ("A") REFERENCES "Inspector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InspectorToInvitation" ADD CONSTRAINT "_InspectorToInvitation_B_fkey" FOREIGN KEY ("B") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
