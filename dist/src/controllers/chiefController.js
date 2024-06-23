"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppointment = exports.countDeniedForms = exports.countApprovedForms = exports.userCount = exports.allevents = exports.createChief = void 0;
const client_1 = require("@prisma/client");
const backRoom_1 = require("../services/backRoom");
const db_1 = __importDefault(require("../dbConfig/db"));
const passworGenerator_1 = require("../utils/passworGenerator");
const hashPassword_1 = require("../utils/hashPassword");
const generateChiefId = async () => {
    const existingChiefCount = await db_1.default.chief.count();
    const chiefCount = existingChiefCount + 1;
    const chiefId = `SUBCHIEF-${chiefCount.toString().padStart(3, '0')}`;
    return chiefId;
};
// Going to be used for subchief
const createChief = async (req, res) => {
    try {
        const { name, email, phoneNumber } = req.body;
        const temporaryPassword = (0, passworGenerator_1.generateTemporaryPassword)();
        const newUser = await db_1.default.user.create({
            data: {
                name,
                email,
                phoneNumber,
                occupation: "SUBCHIEF",
                password: temporaryPassword,
                changePassword: true,
                role: client_1.ROLE.CHIEF,
            },
        });
        const hashedPassword = await (0, hashPassword_1.hashPassword)(temporaryPassword);
        await db_1.default.user.update({
            where: { id: newUser.id },
            data: {
                password: hashedPassword
            }
        });
        const chiefId = await generateChiefId();
        const newChief = await db_1.default.chief.create({
            data: {
                email: newUser.email,
                chiefId,
            },
        });
        const user = await db_1.default.user.findFirst({
            where: {
                email: email
            }
        });
        const frontendURL = process.env.FRONTEND_ORIGIN || '';
        const link = `${frontendURL}/login`;
        await (0, backRoom_1.backroomMessage)(name, email, phoneNumber, temporaryPassword, user.occupation, link);
        res.status(201).json({ message: 'SubChief created successfully', chief: newChief });
    }
    catch (error) {
        console.error('Error occurred while creating chief:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.createChief = createChief;
const allevents = async (req, res) => {
    try {
        console.log("Does it reach here?");
        const allAppointments = await db_1.default.appointment.findMany({
            include: {
                inspector: true,
            },
        });
        res.status(200).json({ appointments: allAppointments });
    }
    catch (error) {
        console.error('Error occurred while fetching appointments:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.allevents = allevents;
const userCount = async (req, res) => {
    try {
        const count = await db_1.default.user.count();
        res.status(200).json({ userCount: count });
    }
    catch (error) {
        console.error('Error occurred while fetching user count:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.userCount = userCount;
const countApprovedForms = async (req, res) => {
    try {
        const approvedApplicationsCount = await db_1.default.application.count({
            where: {
                status: 'APPROVED',
            },
        });
        const approvedOrganizationFormsCount = await db_1.default.organizationForm.count({
            where: {
                status: 'APPROVED',
            },
        });
        const totalApprovedCount = approvedApplicationsCount + approvedOrganizationFormsCount;
        res.status(200).json({
            totalApprovedCount,
        });
    }
    catch (error) {
        console.error('Error occurred while counting approved forms:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.countApprovedForms = countApprovedForms;
const countDeniedForms = async (req, res) => {
    try {
        const deniedApplicationsCount = await db_1.default.application.count({
            where: {
                status: 'DENIED',
            },
        });
        const deniedOrganizationFormsCount = await db_1.default.organizationForm.count({
            where: {
                status: 'DENIED',
            },
        });
        const totalDeniedCount = deniedApplicationsCount + deniedOrganizationFormsCount;
        res.status(200).json({
            totalDeniedCount,
        });
    }
    catch (error) {
        console.error('Error occurred while counting denied forms:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.countDeniedForms = countDeniedForms;
const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'ID is required' });
        }
        const appointment = await db_1.default.appointment.findUnique({
            where: { id: Number(id) },
        });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        await db_1.default.appointment.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: 'Appointment deleted successfully' });
    }
    catch (error) {
        console.error('Error occurred while deleting appointment:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.deleteAppointment = deleteAppointment;
