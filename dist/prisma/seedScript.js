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
const phoneNumber = '233-542370701';
async function seedScript() {
    // Check if the user with the given email already exists
    const existingUserByEmail = await db_1.default.user.findFirst({
        where: {
            email: email
        }
    });
    if (existingUserByEmail) {
        // If the user exists, delete it
        await db_1.default.user.delete({
            where: {
                email: email
            }
        });
        logMessage('Existing user with email deleted.');
    }
    // Check if the user with the given phoneNumber already exists
    const existingUserByPhoneNumber = await db_1.default.user.findFirst({
        where: {
            phoneNumber: phoneNumber
        }
    });
    if (existingUserByPhoneNumber) {
        // If the user exists, delete it
        await db_1.default.user.delete({
            where: {
                phoneNumber: phoneNumber
            }
        });
        logMessage('Existing user with phoneNumber deleted.');
    }
    // Create the user with the specified details
    const hashedPassword = (0, bcrypt_1.hashSync)('$nanaKwakuDollars', 10);
    await db_1.default.user.create({
        data: {
            username: "Nana Kwaku Duah",
            email: email,
            phoneNumber: phoneNumber,
            password: hashedPassword,
            role: client_1.ROLE.ADMIN,
            changePassword: false
        }
    });
    logMessage('User created successfully.');
}
exports.seedScript = seedScript;
seedScript();
