"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.sendOTP = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const secrets_1 = require("../secrets");
const sendOTP = async function (phoneNumber) {
    try {
        // Set OTP expiration time (10 minutes from now)
        const expirationTime = Date.now() + 10 * 60 * 1000;
        const resp = await (0, node_fetch_1.default)(`https://api-devp-otp-2704.hubtel.com/otp/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${secrets_1.username}:${secrets_1.password}`).toString('base64')
            },
            body: JSON.stringify({
                senderId: secrets_1.senderId,
                phoneNumber: phoneNumber,
                countryCode: 'GH',
                expirationTime: expirationTime
            })
        });
        const data = await resp.json();
        console.log(data);
        if (data.code === '0000') {
            const requestId = data.data.requestId;
            const prefix = data.data.prefix;
            console.log(requestId, prefix);
            return { requestId, prefix, expirationTime };
        }
        else {
            console.error('Error sending OTP:', data.message);
            return null;
        }
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        return null;
    }
};
exports.sendOTP = sendOTP;
async function verifyOTP(requestId, prefix, code) {
    try {
        const resp = await (0, node_fetch_1.default)(`https://api-devp-otp-2704.hubtel.com/otp/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${secrets_1.username}:${secrets_1.password}`).toString('base64')
            },
            body: JSON.stringify({
                requestId: requestId,
                prefix: prefix,
                code: code
            })
        });
        if (resp.status === 200) {
            console.log("OTP verified successfully.");
            return true;
        }
        else {
            console.error('OTP verification failed. Status:', resp.status);
            return false;
        }
    }
    catch (error) {
        console.error('Error verifying OTP:', error);
        return false;
    }
}
exports.verifyOTP = verifyOTP;
;
