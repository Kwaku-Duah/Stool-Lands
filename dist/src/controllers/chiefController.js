"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChief = void 0;
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
        const link = `${frontendURL}/${user?.id}`;
        await (0, backRoom_1.backroomMessage)(name, email, phoneNumber, temporaryPassword, user.occupation, link);
        res.status(201).json({ message: 'Chief created successfully', chief: newChief });
    }
    catch (error) {
        console.error('Error occurred while creating chief:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.createChief = createChief;
