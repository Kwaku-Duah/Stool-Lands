"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChief = void 0;
const bcrypt_1 = require("bcrypt");
const client_1 = require("@prisma/client");
const backRoom_1 = require("../services/backRoom");
const prisma = new client_1.PrismaClient();
const generateChiefId = async () => {
    const existingChiefCount = await prisma.chief.count();
    const chiefCount = existingChiefCount + 1;
    const chiefId = `CHIEF-${chiefCount.toString().padStart(3, '0')}`;
    return chiefId;
};
const createChief = async (req, res) => {
    try {
        const { name, email, phoneNumber, occupation, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'New password and confirm password do not match' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        const hashedPassword = (0, bcrypt_1.hashSync)(newPassword, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber,
                occupation,
                password: hashedPassword,
                role: client_1.ROLE.CHIEF,
            },
        });
        const chiefId = await generateChiefId();
        const newChief = await prisma.chief.create({
            data: {
                email: newUser.email,
                chiefId,
            },
        });
        await (0, backRoom_1.backroomMessage)(name, email, phoneNumber, newPassword, occupation);
        res.status(201).json({ message: 'Chief created successfully', chief: newChief });
    }
    catch (error) {
        console.error('Error occurred while creating chief:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.createChief = createChief;
