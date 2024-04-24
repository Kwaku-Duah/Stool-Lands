"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecretary = void 0;
const bcrypt_1 = require("bcrypt");
const client_1 = require("@prisma/client");
const backRoom_1 = require("../services/backRoom");
const prisma = new client_1.PrismaClient();
const generateSecretaryId = async () => {
    const existingSecretaryCount = await prisma.secretary.count();
    const secretaryCount = existingSecretaryCount + 1;
    const secretaryId = `SECRETARY-${secretaryCount.toString().padStart(3, '0')}`;
    return secretaryId;
};
const createSecretary = async (req, res) => {
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
                role: client_1.ROLE.SECRETARY,
            },
        });
        const secretaryId = await generateSecretaryId();
        const newSecretary = await prisma.secretary.create({
            data: {
                email: newUser.email,
                secretaryId,
            },
        });
        await (0, backRoom_1.backroomMessage)(name, email, phoneNumber, newPassword, occupation);
        res.status(201).json({ message: 'Secretary created successfully', secretary: newSecretary });
    }
    catch (error) {
        console.error('Error occurred while creating secretary:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.createSecretary = createSecretary;
