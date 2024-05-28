"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = exports.secretaryMiddleware = exports.applicantMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const secrets_1 = require("../secrets");
const unAuthorised_1 = require("../exceptions/unAuthorised");
const rootException_1 = require("../exceptions/rootException");
const db_1 = __importDefault(require("../dbConfig/db"));
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication token not provided' });
        }
        try {
            const payload = jwt.verify(token, secrets_1.JWT_SECRET);
            const user = await db_1.default.user.findFirst({ where: { id: payload.userId } });
            if (!user) {
                throw new unAuthorised_1.UnauthorizedException('Unauthorized', rootException_1.ErrorCode.UNAUTHORIZED);
            }
            req.user = {
                id: user.id,
                role: user.role
            };
            next();
        }
        catch (error) {
            next(new unAuthorised_1.UnauthorizedException('Unauthorized', rootException_1.ErrorCode.UNAUTHORIZED));
        }
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = (req, res, next) => {
    try {
        const { role } = req.user;
        if (role === 'ADMIN') {
            next();
        }
        else {
            return res.status(403).json({ error: 'Insufficient privileges' });
        }
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.adminMiddleware = adminMiddleware;
const applicantMiddleware = (req, res, next) => {
    try {
        const { role } = req.user;
        if (role === 'APPLICANT') {
            next();
        }
        else {
            return res.status(403).json({ error: 'Insufficient privileges' });
        }
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.applicantMiddleware = applicantMiddleware;
const secretaryMiddleware = (req, res, next) => {
    try {
        const { role } = req.user;
        if (role === 'SECRETARY') {
            next();
        }
        else {
            return res.status(403).json({ error: 'Insufficient privileges' });
        }
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.secretaryMiddleware = secretaryMiddleware;
const roleMiddleware = (req, res, next) => {
    try {
        const { role } = req.user;
        console.log("request", req);
        if (role === 'ADMIN' || role === 'SECRETARY') {
            next();
        }
        else {
            return res.status(403).json({ error: 'Insufficient Privileges' });
        }
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.roleMiddleware = roleMiddleware;
