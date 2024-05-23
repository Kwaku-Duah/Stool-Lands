"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrganizationForm = void 0;
const uuid_1 = require("uuid");
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = require("dotenv");
const db_1 = __importDefault(require("../dbConfig/db"));
(0, dotenv_1.config)();
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const createOrganizationForm = async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log(userId);
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { organisationName, location, mailingAddress, contactNumber, emailAddress, landLocality, siteName, plotNumbers, totalLandSize, streetName, landTransferor, dateOfOriginalTransfer, purposeOfLand, contactOfTransferor } = req.body;
        // Check if any file is uploaded
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
        const endpoint = req.originalUrl;
        console.log(endpoint);
        const type = endpoint.includes('org-apply') ? 'organization' :
            endpoint.includes('joint-apply') ? 'joint' : 'individual';
        const stateForms = await db_1.default.stateForm.findMany({
            where: { userId, status: 'UNUSED' },
            select: {
                id: true,
                clientReference: true,
                token: true,
            }
        });
        let validForm = null;
        for (const stateForm of stateForms) {
            const transaction = await db_1.default.transaction.findFirst({
                where: {
                    clientReference: stateForm.clientReference,
                    serviceId: type
                },
                select: {
                    serviceId: true,
                }
            });
            if (transaction?.serviceId === type) {
                validForm = stateForm;
                // Update the status of the state form to 'USED'
                await db_1.default.stateForm.update({
                    where: { id: stateForm.id },
                    data: { status: 'USED' }
                });
                break;
            }
        }
        if (!validForm) {
            return res.status(404).json({ message: 'No valid forms found for the specified type' });
        }
        const uniqueFormID = validForm.token;
        const organizationForm = await db_1.default.organizationForm.create({
            data: {
                uniqueFormID,
                organisationName,
                location,
                mailingAddress,
                contactNumber,
                emailAddress,
                landLocality,
                siteName,
                plotNumbers,
                totalLandSize,
                streetName,
                landTransferor,
                dateOfOriginalTransfer,
                purposeOfLand,
                contactOfTransferor,
                type,
                documents: {
                    createMany: {
                        data: uploadedDocumentUrls
                    }
                },
                formStatus: 'FILLED',
                status: 'PENDING',
                User: { connect: { id: userId } }
            },
            include: {
                documents: true
            }
        });
        res.status(201).json({ message: 'Organization form submitted successfully', organizationForm });
    }
    catch (error) {
        console.error('Error occurred in createOrganizationForm:', error);
        res.status(500).json({ error: error.message || 'An error occurred while processing your request' });
    }
};
exports.createOrganizationForm = createOrganizationForm;
