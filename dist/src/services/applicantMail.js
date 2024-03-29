"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicantNotice = void 0;
const fs_1 = require("fs");
const handlebars_1 = __importDefault(require("handlebars"));
const secrets_1 = require("../secrets");
const mailer_1 = require("../utils/mailer");
const applicantSMS_1 = require("./applicantSMS");
const applicantNotice = async (username, email, phoneNumber, staffId) => {
    try {
        // Read HTML template file
        const location = await fs_1.promises.readFile('src/templates/applicantEmail.html', 'utf-8');
        const template = handlebars_1.default.compile(location);
        // Define placeholders for the template
        const placeHolders = {
            username: username,
            staffId: staffId,
            email: email,
            phoneNumber: phoneNumber,
            frontURL: secrets_1.FRONTEND_ORIGIN
        };
        // Render HTML message
        const htmlMessage = template(placeHolders);
        // Send email
        await mailer_1.transporter.sendMail({
            from: secrets_1.ADMIN_MAIL,
            to: email,
            subject: "Welcome to Pakyi No. 2 Stool Lands",
            text: 'Hello',
            html: htmlMessage
        });
        // Extract SMS content from HTML message (if needed)
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
exports.applicantNotice = applicantNotice;
