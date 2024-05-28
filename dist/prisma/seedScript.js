"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedScript = void 0;
const bcrypt_1 = require("bcrypt");
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../src/dbConfig/db"));
const logMessage = (message) => {
    process.stdout.write(`${message}\n`);
};
const email = 'duah229@gmail.com';
const phoneNumber = '233542370701';
async function seedScript() {
    const existingUserByEmail = await db_1.default.user.findFirst({
        where: {
            email: email
        }
    });
    if (existingUserByEmail) {
        await db_1.default.user.delete({
            where: {
                email: email
            }
        });
        logMessage('Existing user with email deleted.');
    }
    const existingUserByPhoneNumber = await db_1.default.user.findFirst({
        where: {
            phoneNumber: phoneNumber
        }
    });
    if (existingUserByPhoneNumber) {
        await db_1.default.user.delete({
            where: {
                phoneNumber: phoneNumber
            }
        });
        logMessage('Existing user with phoneNumber deleted.');
    }
    const hashedPassword = (0, bcrypt_1.hashSync)('$nanaKwakuDollars', 10);
    await db_1.default.user.create({
        data: {
            name: "Nana Kwaku Duah",
            email: email,
            phoneNumber: phoneNumber,
            password: hashedPassword,
            occupation: "CHIEF",
            changePassword: false,
            role: client_1.ROLE.ADMIN,
        }
    });
    logMessage('User created successfully.');
}
exports.seedScript = seedScript;
seedScript();
