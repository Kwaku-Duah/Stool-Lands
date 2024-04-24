"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrganizationForm = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = require("dotenv");
const unique_1 = require("../utils/unique");
(0, dotenv_1.config)();
const prisma = new client_1.PrismaClient();
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
        const { organisationName, location, mailingAddress, contactNumber, emailAddress, organizationLogo, landLocality, siteName, plotNumbers, totalLandSize, streetName, landTransferor, dateOfOriginalTransfer, purposeOfLand, contactOfTransferor, payments, documents } = req.body;
        if (!Array.isArray(documents)) {
            throw new Error('Documents should be an array');
        }
        if (!Array.isArray(payments)) {
            throw new Error('Payments should be an array');
        }
        for (const payment of payments) {
            if (typeof payment.paymentType !== 'string' || isNaN(payment.amount) || typeof payment.paymentStatus !== 'string') {
                throw new Error('Invalid payment data');
            }
        }
        const uniqueFormID = (0, unique_1.generateUniqueFormID)();
        const uploadedDocumentUrls = await Promise.all(documents.map(async (document) => {
            const key = `organization/${userId}/${(0, uuid_1.v4)()}-${document.image.split('/').pop()}`;
            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: key,
                Body: document.data,
                ContentType: document.mimetype
            };
            await s3Client.send(new client_s3_1.PutObjectCommand(params));
            return {
                type: document.type,
                image: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`
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
        const organizationForm = await prisma.organizationForm.create({
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
                payments: {
                    createMany: {
                        data: payments
                    }
                },
                documents: {
                    createMany: {
                        data: uploadedDocumentUrls
                    }
                },
                status: 'PENDING',
                User: { connect: { id: userId } }
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
