"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInspector = void 0;
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
