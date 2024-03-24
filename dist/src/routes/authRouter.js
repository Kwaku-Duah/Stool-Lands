"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const erroHandler_1 = require("../erroHandler");
const authRoutes = (0, express_1.Router)();
authRoutes.post('/signup', (0, erroHandler_1.errorHandler)(authController_1.signup));
authRoutes.post('/login', (0, erroHandler_1.errorHandler)(authController_1.login));
exports.default = authRoutes;
