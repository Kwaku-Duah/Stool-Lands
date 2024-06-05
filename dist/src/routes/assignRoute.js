"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignmentController_1 = require("../controllers/assignmentController");
const authMiddleware_1 = require("../middleWares/authMiddleware");
const assignRoutes = (0, express_1.Router)();
assignRoutes.post('/inspector', [authMiddleware_1.authMiddleware, authMiddleware_1.roleMiddleware], assignmentController_1.assignInspector);
exports.default = assignRoutes;
