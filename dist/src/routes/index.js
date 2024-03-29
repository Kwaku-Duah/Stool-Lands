"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRouter_1 = __importDefault(require("./authRouter"));
const forgotRoutes_1 = __importDefault(require("./forgotRoutes"));
const rootRouter = (0, express_1.Router)();
rootRouter.use('/auth', authRouter_1.default);
rootRouter.use('/password', forgotRoutes_1.default);
exports.default = rootRouter;
