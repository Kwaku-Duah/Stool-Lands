"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleWares/authMiddleware");
const userRoute = (0, express_1.Router)();
userRoute.get('/users', [authMiddleware_1.authMiddleware, authMiddleware_1.roleMiddleware], userController_1.allUsers);
// route for admin/secretary
userRoute.get('/forms', [authMiddleware_1.authMiddleware, authMiddleware_1.roleMiddleware], userController_1.getAllForms);
exports.default = userRoute;
