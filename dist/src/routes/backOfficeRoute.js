"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const secretaryController_1 = require("../controllers/secretaryController");
const inspectorController_1 = require("../controllers/inspectorController");
const chiefController_1 = require("../controllers/chiefController");
const authMiddleware_1 = require("../middleWares/authMiddleware");
const backRoute = express_1.default.Router();
backRoute.post('/secretary', [authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware], secretaryController_1.createSecretary);
// inspector
backRoute.post('/proof', [authMiddleware_1.authMiddleware, authMiddleware_1.inspectorMiddleware], inspectorController_1.inspectProof);
backRoute.post('/inspector', [authMiddleware_1.authMiddleware, authMiddleware_1.roleMiddleware], inspectorController_1.createInspector);
backRoute.post('/chief', [authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware], chiefController_1.createChief);
exports.default = backRoute;
