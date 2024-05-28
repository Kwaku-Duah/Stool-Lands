"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backroomMessage = void 0;
const fs_1 = require("fs");
const handlebars_1 = __importDefault(require("handlebars"));
const secrets_1 = require("../secrets");
const mailer_1 = require("../utils/mailer");
const applicantSMS_1 = require("./applicantSMS");
const backroomMessage = async (name, email, phoneNumber, temporaryPassword, occupation, link) => {
    try {
        const location = await fs_1.promises.readFile('src/templates/backroomMessage.html', 'utf-8');
        const template = handlebars_1.default.compile(location);
        const placeHolders = {
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            temporaryPassword: temporaryPassword,
            occupation: occupation,
            frontURL: link
        };
        console.log(placeHolders);
        const htmlMessage = template(placeHolders);
        if (email) {
            // Send email
            await mailer_1.transporter.sendMail({
                from: secrets_1.ADMIN_MAIL,
                to: email,
                subject: "Welcome to Pakyi No. 2 Stool Lands",
                text: 'Hello',
                html: htmlMessage
            });
        }
        else {
            console.log("No email provided. Skipping email sending.");
        }
        const smsContent = htmlMessage.replace(/(<([^>]+)>)/gi, '');
        console.log(smsContent);
        // Send SMS
        await (0, applicantSMS_1.sendSMS)(phoneNumber, smsContent);
        console.log("Email and SMS sent successfully");
    }
    catch (error) {
        console.error("Error sending email and SMS:", error);
    }
};
exports.backroomMessage = backroomMessage;
