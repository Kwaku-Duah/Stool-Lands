"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApplicantID = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../dbConfig/db"));
const generateApplicantID = async () => {
    const lastApplicant = await db_1.default.user.findFirst({
        where: { role: client_1.ROLE.APPLICANT },
        orderBy: { staffId: 'desc' }
    });
    const lastUserId = lastApplicant ? parseInt(lastApplicant.staffId.split('-')[1]) : 0;
    const newApplicantId = `APPLICANTId-${String(lastUserId + 1).padStart(5, '0')}`;
    return newApplicantId;
};
exports.generateApplicantID = generateApplicantID;
