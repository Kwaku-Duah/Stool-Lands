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
        const { organisationName, location, mailingAddress, contactNumber, emailAddress, organizationLogo, landLocality, siteName, plotNumbers, totalLandSize, streetName, landTransferor, dateOfOriginalTransfer, purposeOfLand, contactOfTransferor, documents } = req.body;
        if (!Array.isArray(documents)) {
            throw new Error('Documents should be an array');
        }
        const uploadedDocumentUrls = await Promise.all(documents.map(async (document) => {
            const key = `${userId}/${(0, uuid_1.v4)()}-${document.name}`;
            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: key,
                Body: document.data,
                ContentType: document.mimetype
            };
            await s3Client.send(new client_s3_1.PutObjectCommand(params));
            return {
                type: document.type,
                url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`
            };
        }));
        const logoKey = `organization/${userId}/${(0, uuid_1.v4)()}-logo.jpg`;
        const logoParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: logoKey,
            Body: organizationLogo,
            ContentType: 'image/jpeg'
        };
        await s3Client.send(new client_s3_1.PutObjectCommand(logoParams));
        const uploadedLogoUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${logoKey}`;
        const stateForm = await db_1.default.stateForm.findFirst({
            where: {
                userId: userId,
                status: 'UNUSED'
            }
        });
        if (!stateForm) {
            return res.status(404).json({ message: 'No unused stateForm found for the user' });
        }
        const uniqueFormID = stateForm.token;
        const organizationForm = await db_1.default.organizationForm.create({
            data: {
                uniqueFormID,
                organisationName,
                location,
                mailingAddress,
                contactNumber,
                emailAddress,
                organizationLogo: uploadedLogoUrl,
                landLocality,
                siteName,
                plotNumbers,
                totalLandSize,
                streetName,
                landTransferor,
                dateOfOriginalTransfer,
                purposeOfLand,
                contactOfTransferor,
                type: "org",
                documents: {
                    createMany: {
                        data: uploadedDocumentUrls
                    }
                },
                formStatus: 'FILLED',
                status: 'PENDING',
                User: { connect: { id: userId } }
            }
        });
        await db_1.default.stateForm.update({
            where: {
                id: stateForm.id
            },
            data: {
                status: 'USED'
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
