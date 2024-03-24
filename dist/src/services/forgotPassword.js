"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = void 0;
const fs_1 = require("fs");
const handlebars_1 = __importDefault(require("handlebars"));
const secrets_1 = require("../secrets");
const mailer_1 = require("../utils/mailer");
const sendPasswordResetEmail = async (username, email, link) => {
    const location = await fs_1.promises.readFile('src/templates/forgotEmail.html', 'utf-8');
    const template = handlebars_1.default.compile(location);
    const placeHolders = {
        username: username,
        email: email,
        frontendURL: link
    };
    const htmlMessage = template(placeHolders);
    return mailer_1.transporter.sendMail({
        from: secrets_1.ADMIN_MAIL,
        to: email,
        subject: 'Forgotten your password, reset it...',
        text: 'Hello Reset...',
        html: htmlMessage
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
