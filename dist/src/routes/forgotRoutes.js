"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const erroHandler_1 = require("../erroHandler");
const passwordController_1 = require("../controllers/passwordController");
const forgotRoute = (0, express_1.Router)();
forgotRoute.post('/forgot', (0, erroHandler_1.errorHandler)(passwordController_1.forgotReset));
forgotRoute.post('/reset', (0, erroHandler_1.errorHandler)(passwordController_1.changePassword));
exports.default = forgotRoute;
