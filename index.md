// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ROLE {
  ADMIN
  CHIEF
  SECRETARY
  INSPECTOR
  APPLICANT
}

model User {
  id              Int       @id @default(autoincrement())
  username        String
  email           String    @unique
  password        String
  role            ROLE
  staffId         String    @unique
  phoneNumber     String    @unique
  changePassword  Boolean   @default(true)
}

model Admin {
  id      Int      @id @default(autoincrement())
  staffId String   @unique
  email   String   @unique
}

model Applicant {
  id             Int      @id @default(autoincrement())
  email          String   @unique
  applicantId    String   @unique
  applications   Application[]
}

model Application {
  id                   Int       @id @default(autoincrement())
  applicantId          Int
  dateCreated          DateTime
  dateUpdated          DateTime
  applicantName        String
  dateOfBirth          DateTime
  mailAddress          String
  contact              String
  emailAddress         String
  placeOfResidence     String
  maritalStatus        String
  nextOfKin            String
  nextOfKinNumber      String
  locality             String
  siteName             String
  plotNumber           String
  totalLandSize        String
  photo                String   // Add the field for applicant's photo
  Applicant            Applicant @relation(fields: [applicantId], references: [applicantId])
}



// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ROLE {
  ADMIN
  CHIEF
  SECRETARY
  INSPECTOR
  APPLICANT
}

model User {
  id              Int       @id @default(autoincrement())
  username        String
  email           String    @unique
  password        String
  role            ROLE
  staffId         String    @unique
  phoneNumber     String    @unique
  changePassword  Boolean   @default(true)
}

model Admin {
  id      Int      @id @default(autoincrement())
  staffId String   @unique
  email   String   @unique
}

model Applicant {
  id             Int           @id @default(autoincrement())
  email          String        @unique
  applicantId    String        @unique
  applications   Application[]
}

model Application {
  id                   Int       @id @default(autoincrement())
  applicantId          Int
  dateCreated          DateTime
  dateUpdated          DateTime
  applicantName        String
  dateOfBirth          DateTime
  mailAddress          String
  contact              String
  emailAddress         String
  placeOfResidence     String
  maritalStatus        String
  nextOfKin            String
  nextOfKinNumber      String
  locality             String
  siteName             String
  plotNumber           String
  totalLandSize        String
  photo                String
  inspectionReports    InspectionReport[]
  Secretary            Secretary?   @relation(fields: [secretaryId], references: [id])
  inspector            Inspector?   @relation(fields: [inspectorId], references: [id])
}

model InspectionReport {
  id                   Int       @id @default(autoincrement())
  applicationId        Int
  inspectorId          Int
  date                 DateTime
  remarks              String
  proofs               String[]
  recommendation       String
  application          Application @relation(fields: [applicationId], references: [id])
  inspector            Inspector   @relation(fields: [inspectorId], references: [id])
}

model Secretary {
  id                   Int       @id @default(autoincrement())
  userId               Int       @unique
  calendar             Calendar[]
  User                 User      @relation(fields: [userId], references: [id])
}

model Inspector {
  id                   Int       @id @default(autoincrement())
  userId               Int       @unique
  applications         Application[]
  InspectionReports    InspectionReport[]
  User                 User      @relation(fields: [userId], references: [id])
}

model Calendar {
  id                   Int       @id @default(autoincrement())
  eventId              String    @unique
  date                 DateTime
  description          String
  reminder             Boolean   @default(false)
  secretary            Secretary @relation(fields: [secretaryId], references: [id])
}





// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ROLE {
  ADMIN
  CHIEF
  SECRETARY
  INSPECTOR
  APPLICANT
}

model User {
  id              Int       @id @default(autoincrement())
  username        String
  email           String    @unique
  password        String
  role            ROLE
  staffId         String    @unique
  phoneNumber     String    @unique
  changePassword  Boolean   @default(true)
}

model Admin {
  id      Int      @id @default(autoincrement())
  staffId String   @unique
  email   String   @unique
}

model Applicant {
  id             Int            @id @default(autoincrement())
  email          String         @unique
  applicantId    String         @unique
  applications   Application[]
}

model Application {
  id                   Int       @id @default(autoincrement())
  applicantId          Int
  dateCreated          DateTime
  dateUpdated          DateTime
  applicantName        String
  dateOfBirth          DateTime
  mailAddress          String
  contact              String
  emailAddress         String
  placeOfResidence     String
  maritalStatus        String
  nextOfKin            String
  nextOfKinNumber      String
  locality             String
  siteName             String
  plotNumber           String
  totalLandSize        String
  photo                String
  inspectionReports    InspectionReport[]
  Secretary            Secretary?   @relation(fields: [secretaryId], references: [id])
  inspector            Inspector?   @relation(fields: [inspectorId], references: [id])
}

model InspectionReport {
  id                   Int       @id @default(autoincrement())
  applicationId        Int
  inspectorId          Int
  date                 DateTime
  remarks              String
  proofs               String[]
  recommendation       String
  application          Application @relation(fields: [applicationId], references: [id])
  inspector            Inspector   @relation(fields: [inspectorId], references: [id])
}

model Secretary {
  id                   Int       @id @default(autoincrement())
  userId               Int       @unique
  calendar             Calendar[]
  User                 User      @relation(fields: [userId], references: [id])
}

model Inspector {
  id                   Int       @id @default(autoincrement())
  userId               Int       @unique
  applications         Application[]
  InspectionReports    InspectionReport[]
  User                 User      @relation(fields: [userId], references: [id])
}

model Calendar {
  id                   Int       @id @default(autoincrement())
  eventId              String    @unique
  date                 DateTime
  description          String
  reminder             Boolean   @default(false)
  secretary            Secretary @relation(fields: [secretaryId], references: [id])
}

model Chief {
  id                   Int       @id @default(autoincrement())
  userId               Int       @unique
  applications         Application[]
  User                 User      @relation(fields: [userId], references: [id])
}
