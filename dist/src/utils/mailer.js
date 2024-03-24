"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const secrets_1 = require("../secrets");
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: secrets_1.ADMIN_MAIL,
        pass: secrets_1.ADMIN_PASS
    }
});
