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
const uploadMulter_1 = __importDefault(require("../middleWares/uploadMulter"));
const backRoute = express_1.default.Router();
backRoute.post('/secretary', [authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware], secretaryController_1.createSecretary);
backRoute.post('/proof', [authMiddleware_1.authMiddleware, authMiddleware_1.inspectorMiddleware], uploadMulter_1.default.any(), inspectorController_1.inspectProof);
backRoute.post('/inspector', [authMiddleware_1.authMiddleware, authMiddleware_1.roleMiddleware], inspectorController_1.createInspector);
backRoute.post('/chief', [authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware], chiefController_1.createChief);
backRoute.post('/schedule', [authMiddleware_1.authMiddleware, authMiddleware_1.secretaryMiddleware], secretaryController_1.appointmentChief);
exports.default = backRoute;
