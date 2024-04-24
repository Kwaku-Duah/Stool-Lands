"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_KEY = exports.USERNAME_KEY = exports.senderId = exports.password = exports.username = exports.FRONTEND_ORIGIN = exports.ADMIN_PASS = exports.ADMIN_MAIL = exports.PORT = exports.expiration = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.expiration = "1h";
exports.PORT = "5000";
exports.ADMIN_MAIL = process.env.ADMIN_MAIL;
exports.ADMIN_PASS = process.env.ADMIN_PASS;
exports.FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
exports.username = process.env.USERNAME;
exports.password = process.env.PASSWORD;
exports.senderId = process.env.SENDERID;
exports.USERNAME_KEY = process.env.USERNAME_KEY;
exports.PASSWORD_KEY = process.env.PASSWORD_KEY;
