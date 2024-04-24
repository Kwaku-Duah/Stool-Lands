"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transactionController_1 = require("../controllers/transactionController");
const authMiddleware_1 = require("../middleWares/authMiddleware");
const callbackRoute = express_1.default.Router();
// Route for handling payment callbacks
callbackRoute.post('/callback', transactionController_1.handlePaymentCallback);
callbackRoute.get('/exist', authMiddleware_1.authMiddleware, transactionController_1.checkUnusedFormForUser);
callbackRoute.get('/state', transactionController_1.checkTransactionStatus);
exports.default = callbackRoute;
