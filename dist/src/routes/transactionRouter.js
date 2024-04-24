"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const createTransaction_1 = require("../controllers/createTransaction");
const authMiddleware_1 = require("../middleWares/authMiddleware");
const transactionRoute = express_1.default.Router();
transactionRoute.post('/transactions', [authMiddleware_1.authMiddleware], createTransaction_1.createTransaction);
exports.default = transactionRoute;
