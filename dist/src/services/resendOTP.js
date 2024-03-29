"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOTP = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const secrets_1 = require("../secrets");
async function resendOTP(requestId) {
    try {
        const resp = await (0, node_fetch_1.default)(`https://api-devp-otp-2704.hubtel.com/otp/resend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${secrets_1.username}:${secrets_1.password}`).toString('base64')
            },
            body: JSON.stringify({ requestId })
        });
        const data = await resp.json();
        console.log(data);
        return data;
    }
    catch (error) {
        console.error('Error resending OTP:', error);
        throw error;
    }
}
exports.resendOTP = resendOTP;
