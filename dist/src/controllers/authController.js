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
exports.login = exports.signup = void 0;
const db_1 = __importDefault(require("../dbConfig/db"));
const bcrypt_1 = require("bcrypt");
const jwt = __importStar(require("jsonwebtoken"));
const secrets_1 = require("../secrets");
const client_1 = require("@prisma/client");
const applicantMail_1 = require("../services/applicantMail");
const genApplicantId_1 = require("../utils/genApplicantId");
const applicantId = await (0, genApplicantId_1.generateApplicantID)();
const signup = async (req, res, next) => {
    try {
        const { username, email, password, phoneNumber } = req.body;
        // Check if the email is already registered
        const existingUserByEmail = await db_1.default.user.findFirst({
            where: {
                email: email
            }
        });
        if (existingUserByEmail) {
            throw new Error('Email is already registered');
        }
        // Check if the phone number is already registered
        const existingUserByPhoneNumber = await db_1.default.user.findFirst({
            where: {
                phoneNumber: phoneNumber
            }
        });
        if (existingUserByPhoneNumber) {
            throw new Error('Phone number is already registered');
        }
        // Hash the password
        const hashedPassword = (0, bcrypt_1.hashSync)(password, 10);
        // Create the user
        const newUser = await db_1.default.user.create({
            data: {
                username: username,
                email: email,
                phoneNumber: phoneNumber,
                password: hashedPassword,
                role: client_1.ROLE.APPLICANT
            }
        });
        await (0, applicantMail_1.applicantNotice)(username, newUser.email, phoneNumber);
        // Create JWT token
        const token = jwt.sign({ userId: newUser.id, role: newUser.role }, secrets_1.JWT_SECRET, {
            expiresIn: secrets_1.expiration
        });
        res.json({ user: { ...newUser, password: undefined }, token });
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
        const changePassword = user.role === 'ADMIN' ? false : user.changePassword;
        const token = jwt.sign({ userId: user.id, role: user.role }, secrets_1.JWT_SECRET, {
            expiresIn: secrets_1.expiration
        });
        res.json({ user: { ...user, password: undefined, changePassword }, token });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
