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
exports.resendOTPController = exports.verifyOTPController = exports.OTPSend = exports.changePassword = exports.forgotReset = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../dbConfig/db"));
const jwt = __importStar(require("jsonwebtoken"));
const secrets_1 = require("../secrets");
const base64_url_1 = require("base64-url");
const forgotPassword_1 = require("../services/forgotPassword");
const sendOTP_1 = require("../services/sendOTP");
const resendOTP_1 = require("../services/resendOTP");
const forgotReset = async (req, res) => {
    try {
        const { email } = req.body;
        const errors = [];
        const user = await db_1.default.user.findFirst({
            where: {
                email: email
            }
        });
        if (!user) {
            errors.push({ msg: 'This email does not have an account' });
            res.status(400).json({ errors });
        }
        else {
            const payload = {
                email: user.email,
                id: user.id
            };
            const token = jwt.sign(payload, secrets_1.JWT_SECRET);
            const encodedToken = (0, base64_url_1.encode)(token);
            const frontendURL = process.env.FRONTEND_ORIGIN || '';
            const link = `${frontendURL}/resetPassword/${user.id}/${encodedToken}`;
            await (0, forgotPassword_1.sendPasswordResetEmail)(user.name, email, link);
            console.log("user email", user.email);
            res.status(200).json({ message: 'Password reset link has been sent to your email', link });
        }
    }
    catch (error) {
        const statusCode = error.status || 400;
        res.status(statusCode).json({ message: error.message || 'Bad Request' });
    }
};
exports.forgotReset = forgotReset;
const changePassword = async (req, res) => {
    try {
        const { userId, newPassword, confirmPassword } = req.body;
        if (!userId || !newPassword || !confirmPassword) {
            throw new Error('userId, newPassword, and confirmPassword are required');
        }
        if (newPassword !== confirmPassword) {
            throw new Error('New password and confirm password do not match');
        }
        // Ensure password meets complexity requirements
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            throw new Error('Password must contain at least 8 characters including letters, numbers, and special symbols');
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await db_1.default.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                changePassword: false
            }
        });
        res.status(200).json({ message: 'Password changed successfully', success: true });
    }
    catch (error) {
        const statusCode = error.status || 400;
        res.status(statusCode).json({ message: error.message || 'Bad Request' });
    }
};
exports.changePassword = changePassword;
const OTPSend = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const user = await db_1.default.user.findFirst({
            where: {
                phoneNumber
            }
        });
        if (!user) {
            res.status(400).json({ error: 'INVALID_PHONE_NUMBER', message: 'Phone number does not exist' });
            return;
        }
        const otpResponse = await (0, sendOTP_1.sendOTP)(phoneNumber);
        if (!otpResponse) {
            throw new Error('Error sending OTP');
        }
        console.log('OTP sent successfully');
        const { requestId, prefix } = otpResponse;
        res.json({ userId: user.id, requestId, prefix });
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error || 'Error sending OTP' });
    }
};
exports.OTPSend = OTPSend;
const verifyOTPController = async (req, res, next) => {
    try {
        const { requestId, prefix, code } = req.body;
        console.log(req.body);
        const isOTPVerified = await (0, sendOTP_1.verifyOTP)(requestId, prefix, code);
        console.log(isOTPVerified);
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
const resendOTPController = async (req, res, next) => {
    try {
        const { requestId } = req.body;
        const otpResponse = await (0, resendOTP_1.resendOTP)(requestId);
        res.json(otpResponse);
    }
    catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred while processing your request.' });
        next(error);
    }
};
exports.resendOTPController = resendOTPController;
