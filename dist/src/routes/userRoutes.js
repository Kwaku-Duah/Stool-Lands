"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleWares/authMiddleware");
const userRoute = (0, express_1.Router)();
userRoute.get('/users', [authMiddleware_1.authMiddleware, authMiddleware_1.roleMiddleware], userController_1.allUsers);
// route for admin/secretary
userRoute.get('/forms', [authMiddleware_1.authMiddleware, authMiddleware_1.roleMiddleware], userController_1.getAllForms);
userRoute.get('/tickets', [authMiddleware_1.authMiddleware, authMiddleware_1.roleMiddleware], userController_1.allTickets);
userRoute.post('/user-deactivate', [authMiddleware_1.authMiddleware, authMiddleware_1.roleMiddleware], userController_1.userDeactivate);
userRoute.post('/user-del', [authMiddleware_1.authMiddleware, authMiddleware_1.roleMiddleware], userController_1.deleteUser);
userRoute.get("/:userid", [authMiddleware_1.authMiddleware, authMiddleware_1.roleMiddleware], userController_1.specificForms);
userRoute.post('/user-activate', [authMiddleware_1.authMiddleware, authMiddleware_1.roleMiddleware], userController_1.userActivate);
exports.default = userRoute;
