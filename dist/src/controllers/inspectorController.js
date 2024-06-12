"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectProof = exports.createInspector = void 0;
const client_1 = require("@prisma/client");
const backRoom_1 = require("../services/backRoom");
const db_1 = __importDefault(require("../dbConfig/db"));
const uuid_1 = require("uuid");
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = require("dotenv");
const multer_1 = __importDefault(require("multer"));
const passworGenerator_1 = require("../utils/passworGenerator");
const hashPassword_1 = require("../utils/hashPassword");
(0, dotenv_1.config)();
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const upload = (0, multer_1.default)();
const generateInspectorId = async () => {
    const existingInspectorCount = await db_1.default.inspector.count();
    const inspectorCount = existingInspectorCount + 1;
    const inspectorId = `INSPECTOR-${inspectorCount.toString().padStart(3, '0')}`;
    return inspectorId;
};
const createInspector = async (req, res) => {
    try {
        const { name, email, phoneNumber } = req.body;
        const temporaryPassword = (0, passworGenerator_1.generateTemporaryPassword)();
        const newUser = await db_1.default.user.create({
            data: {
                name,
                email,
                phoneNumber,
                occupation: 'INSPECTOR',
                password: temporaryPassword,
                changePassword: true,
                role: client_1.ROLE.INSPECTOR,
            },
        });
        const hashedPassword = await (0, hashPassword_1.hashPassword)(temporaryPassword);
        await db_1.default.user.update({
            where: { id: newUser.id },
            data: {
                password: hashedPassword
            }
        });
        const inspectorId = await generateInspectorId();
        const newInspector = await db_1.default.inspector.create({
            data: {
                email: newUser.email,
                inspectorId,
            },
        });
        const user = await db_1.default.user.findFirst({
            where: {
                email: email
            }
        });
        const frontendURL = process.env.FRONTEND_ORIGIN || '';
        const link = `${frontendURL}/login`;
        console.log(link);
        await (0, backRoom_1.backroomMessage)(name, email, phoneNumber, temporaryPassword, user.occupation, link);
        res.status(201).json({ message: 'Inspector created successfully', inspector: newInspector });
    }
    catch (error) {
        console.error('Error occurred while creating inspector:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.createInspector = createInspector;
// inspector uploading form proof
const inspectProof = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userEmail = user.email;
        const inspector = await db_1.default.inspector.findUnique({
            where: { email: userEmail },
            select: { inspectorId: true }
        });
        if (!inspector) {
            return res.status(404).json({ message: 'Inspector not found' });
        }
        const inspectorId = inspector.inspectorId;
        const { uniqueFormID } = req.body;
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: 'No documents uploaded' });
        }
        const uploadedDocumentUrls = await Promise.all(Object.values(req.files).map(async (file) => {
            const key = `${userId}/${(0, uuid_1.v4)()}-${file.originalname}`;
            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
            };
            await s3Client.send(new client_s3_1.PutObjectCommand(params));
            return {
                url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`
            };
        }));
        const proof = await db_1.default.inspectUpload.create({
            data: {
                uniqueFormID,
                inspectorId,
                documents: {
                    createMany: {
                        data: uploadedDocumentUrls
                    }
                },
            },
            include: {
                documents: true
            }
        });
        return res.status(200).json({ success: true, proof });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.inspectProof = inspectProof;
