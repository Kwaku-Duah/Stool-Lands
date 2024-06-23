"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentChief = exports.createSecretary = void 0;
const client_1 = require("@prisma/client");
const backRoom_1 = require("../services/backRoom");
const db_1 = __importDefault(require("../dbConfig/db"));
const passworGenerator_1 = require("../utils/passworGenerator");
const hashPassword_1 = require("../utils/hashPassword");
const generateSecretaryId = async () => {
    const existingSecretaryCount = await db_1.default.secretary.count();
    const secretaryCount = existingSecretaryCount + 1;
    const secretaryId = `SECRETARY-${secretaryCount.toString().padStart(3, '0')}`;
    return secretaryId;
};
const createSecretary = async (req, res) => {
    try {
        const { name, email, phoneNumber } = req.body;
        const temporaryPassword = (0, passworGenerator_1.generateTemporaryPassword)();
        const newUser = await db_1.default.user.create({
            data: {
                name,
                email,
                phoneNumber,
                occupation: "SECRETARY",
                password: temporaryPassword,
                changePassword: true,
                role: client_1.ROLE.SECRETARY,
            },
        });
        const hashedPassword = await (0, hashPassword_1.hashPassword)(temporaryPassword);
        await db_1.default.user.update({
            where: { id: newUser.id },
            data: {
                password: hashedPassword
            }
        });
        const secretaryId = await generateSecretaryId();
        const newSecretary = await db_1.default.secretary.create({
            data: {
                email: newUser.email,
                secretaryId,
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
        res.status(201).json({ message: 'Secretary created successfully', secretary: newSecretary });
    }
    catch (error) {
        console.error('Error occurred while creating secretary:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.createSecretary = createSecretary;
const appointmentChief = async (req, res) => {
    try {
        const { title, tag, applicantName, inspectorEmail, scheduledAt } = req.body;
        const applicant = await db_1.default.user.findFirst({
            where: {
                name: applicantName,
                role: client_1.ROLE.APPLICANT,
            },
        });
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found or invalid input' });
        }
        const inspector = await db_1.default.inspector.findFirst({
            where: {
                email: inspectorEmail,
            },
        });
        if (!inspector) {
            return res.status(404).json({ message: 'Inspector not found' });
        }
        const scheduledDateTime = scheduledAt ? new Date(scheduledAt) : null;
        const newAppointment = await db_1.default.appointment.create({
            data: {
                title,
                tag,
                applicantName,
                inspectorEmail: inspector.email,
                inspectorId: inspector.id,
                scheduledAt: scheduledDateTime,
            },
        });
        res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });
    }
    catch (error) {
        console.error('Error occurred while creating appointment:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.appointmentChief = appointmentChief;
