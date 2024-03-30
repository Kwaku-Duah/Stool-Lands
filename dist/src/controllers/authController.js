"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.signup = void 0;
const db_1 = __importDefault(require("../dbConfig/db"));
const bcrypt_1 = require("bcrypt");
const jwt = __importStar(require("jsonwebtoken"));
const secrets_1 = require("../secrets");
const client_1 = require("@prisma/client");
const applicantMail_1 = require("../services/applicantMail");
const signup = async (req, res, next) => {
    try {
        const { name, email, phoneNumber, occupation, newPassword, confirmPassword } = req.body;
        // Check if the email is provided and is not empty
        if (email && email.trim() !== '') {
            const existingUserByEmail = await db_1.default.user.findFirst({
                where: {
                    email: email
                }
            });
            if (existingUserByEmail) {
                throw new Error('Email is already registered');
            }
        }
        const existingUserByPhoneNumber = await db_1.default.user.findFirst({
            where: {
                phoneNumber: phoneNumber
            }
        });
        if (existingUserByPhoneNumber) {
            throw new Error('Phone number is already registered');
        }
        if (newPassword !== confirmPassword) {
            throw new Error('New password and confirm password do not match');
        }
        if (newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            throw new Error('Password must contain at least 8 characters including letters, numbers, and special symbols');
        }
        const hashedPassword = (0, bcrypt_1.hashSync)(newPassword, 10);
        const newUser = await db_1.default.user.create({
            data: {
                name: name,
                email: email ? email : null,
                phoneNumber: phoneNumber,
                occupation: occupation,
                password: hashedPassword,
                role: client_1.ROLE.APPLICANT
            }
        });
        await (0, applicantMail_1.applicantNotice)(name, email, phoneNumber);
        res.status(200).json({ message: 'Signup successful' });
    }
    catch (error) {
        next(error);
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    try {
        const { emailOrPhone, password } = req.body;
        const user = await db_1.default.user.findFirst({
            where: {
                OR: [{ phoneNumber: emailOrPhone }, { email: emailOrPhone }]
            }
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await (0, bcrypt_1.compare)(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const token = jwt.sign({ userId: user.id, role: user.role }, secrets_1.JWT_SECRET, {
            expiresIn: secrets_1.expiration
        });
        res.json({ user: { ...user, password: undefined }, token, expiration: secrets_1.expiration });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('token');
            res.status(200).json({ message: 'Logged out successfully' });
        }
        else {
            throw new Error('Local storage is not available in this environment');
        }
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
