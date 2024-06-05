"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInspectorAssignments = exports.createInspector = void 0;
const client_1 = require("@prisma/client");
const backRoom_1 = require("../services/backRoom");
const db_1 = __importDefault(require("../dbConfig/db"));
const passworGenerator_1 = require("../utils/passworGenerator");
const hashPassword_1 = require("../utils/hashPassword");
const generateInspectorId = async () => {
    const existingInspectorCount = await db_1.default.inspector.count();
    const inspectorCount = existingInspectorCount + 1;
    const inspectorId = `INSPECTOR-${inspectorCount.toString().padStart(3, '0')}`;
    return inspectorId;
};
const createInspector = async (req, res) => {
    try {
        const { name, email, phoneNumber } = req.body;
        const temporaryPassword = (0, passworGenerator_1.generateTemporaryPassword)();
        const newUser = await db_1.default.user.create({
            data: {
                name,
                email,
                phoneNumber,
                occupation: 'INSPECTOR',
                password: temporaryPassword,
                changePassword: true,
                role: client_1.ROLE.INSPECTOR,
            },
        });
        const hashedPassword = await (0, hashPassword_1.hashPassword)(temporaryPassword);
        await db_1.default.user.update({
            where: { id: newUser.id },
            data: {
                password: hashedPassword
            }
        });
        const inspectorId = await generateInspectorId();
        const newInspector = await db_1.default.inspector.create({
            data: {
                email: newUser.email,
                inspectorId,
            },
        });
        const user = await db_1.default.user.findFirst({
            where: {
                email: email
            }
        });
        const frontendURL = process.env.FRONTEND_ORIGIN || '';
        const link = `${frontendURL}/login`;
        console.log(link);
        await (0, backRoom_1.backroomMessage)(name, email, phoneNumber, temporaryPassword, user.occupation, link);
        res.status(201).json({ message: 'Inspector created successfully', inspector: newInspector });
    }
    catch (error) {
        console.error('Error occurred while creating inspector:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.createInspector = createInspector;
const getInspectorAssignments = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.email) {
            return res.status(404).json({ success: false, message: 'User not found or email is missing' });
        }
        const inspector = await db_1.default.inspector.findUnique({
            where: { email: user.email },
        });
        if (!inspector) {
            return res.status(404).json({ success: false, message: 'Inspector not found' });
        }
        const assignments = await db_1.default.invitation.findMany({
            where: {
                inspectors: {
                    some: {
                        inspectorId: inspector.inspectorId
                    }
                }
            },
            include: {
                Assignment: true,
            },
        });
        return res.status(200).json({ success: true, assignments });
    }
    catch (error) {
        console.error('Error occurred while fetching inspector assignments:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
};
exports.getInspectorAssignments = getInspectorAssignments;
