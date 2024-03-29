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
exports.logout = exports.verifyOTPController = exports.resendOTPController = exports.login = exports.loginWithPhoneNumber = exports.loginWithEmail = exports.signup = void 0;
const db_1 = __importDefault(require("../dbConfig/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const bcrypt_2 = require("bcrypt");
const jwt = __importStar(require("jsonwebtoken"));
const secrets_1 = require("../secrets");
const client_1 = require("@prisma/client");
const ms_1 = __importDefault(require("ms"));
const applicantMail_1 = require("../services/applicantMail");
const genApplicantId_1 = require("../utils/genApplicantId");
const sendOTP_1 = require("../services/sendOTP");
const resendOTP_1 = require("../services/resendOTP");
const signup = async (req, res, next) => {
    try {
        const { username, email, password, phoneNumber } = req.body;
        const newApplicantId = await (0, genApplicantId_1.generateApplicantID)();
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
        const hashedPassword = (0, bcrypt_2.hashSync)(password, 10);
        // Create the user
        const newUser = await db_1.default.user.create({
            data: {
                username: username,
                email: email,
                staffId: newApplicantId,
                phoneNumber: phoneNumber,
                password: hashedPassword,
                role: client_1.ROLE.APPLICANT
            }
        });
        await db_1.default.applicant.create({
            data: {
                id: newUser.id,
                email: newUser.email,
                applicantId: newApplicantId
            }
        });
        await (0, applicantMail_1.applicantNotice)(username, newUser.email, phoneNumber, newUser.staffId);
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
const loginWithEmail = async (email, password, res) => {
    try {
        const user = await db_1.default.user.findFirst({
            where: {
                email
            }
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const changePassword = user.role === 'ADMIN' ? false : user.changePassword;
        const token = jwt.sign({ userId: user.id, role: user.role }, secrets_1.JWT_SECRET, {
            expiresIn: secrets_1.expiration
        });
        const expirationMilliseconds = (0, ms_1.default)(secrets_1.expiration);
        const expirationTime = Date.now() + expirationMilliseconds / (1000 * 60 * 60);
        // Send the token, expiration time, and user details in the response
        res.json({ user: { ...user, password: undefined, changePassword }, token, expirationTime });
    }
    catch (error) {
        throw new Error("Error"); // Rethrow error to be caught by the error handler
    }
};
exports.loginWithEmail = loginWithEmail;
const loginWithPhoneNumber = async (phoneNumber, res) => {
    try {
        // Send OTP
        const otpResponse = await (0, sendOTP_1.sendOTP)(phoneNumber);
        if (!otpResponse) {
            throw new Error('Error sending OTP');
        }
        console.log('OTP sent successfully');
        // Extract requestId and prefix from otpResponse
        const { requestId, prefix } = otpResponse;
        // Find user by phone number
        const user = await db_1.default.user.findFirst({
            where: {
                phoneNumber
            }
        });
        if (!user) {
            throw new Error('Invalid phone number');
        }
        const changePassword = user.role === 'ADMIN' ? false : user.changePassword;
        const token = jwt.sign({ userId: user.id, role: user.role }, secrets_1.JWT_SECRET, {
            expiresIn: secrets_1.expiration
        });
        const expirationMilliseconds = (0, ms_1.default)(secrets_1.expiration);
        const expirationTime = Date.now() + expirationMilliseconds / (1000 * 60 * 60);
        // Send the token, expiration time, and user details in the response
        res.json({ user: { ...user, password: undefined, changePassword }, token, expirationTime, requestId, prefix });
    }
    catch (error) {
        throw new Error("Error");
    }
};
exports.loginWithPhoneNumber = loginWithPhoneNumber;
const login = async (req, res, next) => {
    try {
        const { emailOrPhone, password } = req.body;
        if (emailOrPhone.includes('@')) {
            await (0, exports.loginWithEmail)(emailOrPhone, password, res);
        }
        else {
            await (0, exports.loginWithPhoneNumber)(emailOrPhone, res);
        }
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const resendOTPController = async (req, res, next) => {
    try {
        const { requestId } = req.body;
        const otpResponse = await (0, resendOTP_1.resendOTP)(requestId);
        // Handle the response as needed
        res.json(otpResponse);
    }
    catch (error) {
        next(error);
    }
};
exports.resendOTPController = resendOTPController;
const verifyOTPController = async (req, res, next) => {
    try {
        // Extract required parameters from the request body
        const { requestId, prefix, code } = req.body;
        // Call the OTP verification service with expirationTime parameter
        const isOTPVerified = await (0, sendOTP_1.verifyOTP)(requestId, prefix, code);
        console.log(isOTPVerified);
        // Send response based on OTP verification result
        if (isOTPVerified) {
            res.json({ success: true, message: 'OTP verified successfully' });
        }
        else {
            res.status(400).json({ success: false, message: 'token has expired' });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.verifyOTPController = verifyOTPController;
const logout = async (req, res, next) => {
    try {
        // Clear authentication token (JWT) from local storage
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
