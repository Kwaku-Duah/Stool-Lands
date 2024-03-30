"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const secrets_1 = require("../secrets");
async function sendSMS(phoneNumber, message) {
    try {
        // Construct the URL with dynamic parameters using template literals
        const url = `https://smsc.hubtel.com/v1/messages/send?clientsecret=${secrets_1.password}&clientid=${secrets_1.username}&from=${secrets_1.senderId}&to=${phoneNumber}&content=${encodeURIComponent(message)}`;
        const resp = await (0, node_fetch_1.default)(url);
        const data = await resp.json();
        console.log(data);
    }
    catch (error) {
        console.error("Error sending SMS:", error);
    }
}
exports.sendSMS = sendSMS;
