"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApplicantID = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../dbConfig/db"));
const generateApplicantID = async () => {
    try {
        // Find the last applicant
        const lastApplicant = await db_1.default.user.findFirst({
            where: { role: client_1.ROLE.APPLICANT },
            orderBy: { staffId: 'desc' }
        });
        const lastUserId = lastApplicant ? parseInt(lastApplicant.staffId.split('-')[1]) : 0;
        // Increment the last user's ID
        const newUserId = lastUserId + 1;
        // Generate a new applicant ID
        const newApplicantId = `APPLICANT-${String(newUserId).padStart(5, '0')}`;
        return newApplicantId;
    }
    catch (error) {
        // Handle any errors
        console.error("Error generating applicant ID:", error);
        throw new Error("Failed to generate applicant ID");
    }
};
exports.generateApplicantID = generateApplicantID;
