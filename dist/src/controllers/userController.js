"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllForms = exports.allUsers = void 0;
const db_1 = __importDefault(require("../dbConfig/db"));
const allUsers = async (req, res) => {
    try {
        const users = await db_1.default.user.findMany({
            select: {
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                activeStatus: true
            }
        });
        res.status(200).json({ users });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'An error occurred while fetching users' });
    }
};
exports.allUsers = allUsers;
const getAllForms = async (req, res) => {
    try {
        const applicationForms = await db_1.default.application.findMany({
            include: { documents: true }
        });
        const organizationForms = await db_1.default.organizationForm.findMany({
            include: { documents: true }
        });
        const forms = [...applicationForms, ...organizationForms];
        res.status(200).json({ success: true, forms });
    }
    catch (error) {
        console.error('Error occurred while fetching forms:', error);
        res.status(500).json({ success: false, error: 'An error occurred while processing your request' });
    }
};
exports.getAllForms = getAllForms;
