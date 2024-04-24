"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReport = exports.getFormsCreatedByUser = exports.fillApplicationForm = void 0;
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
const fillApplicationForm = async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log(userId);
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { applicantName, applicantDOB, mailingAddress, contactNumber, emailAddress, placeOfResidence, hometown, maritalStatus, nextOfKin, landLocality, siteName, plotNumbers, totalLandSize, streetName, landTransferor, dateOfOriginalTransfer, purposeOfLand, contactOfTransferor, documents, payments } = req.body;
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
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser) {
            throw new Error(`User with ID ${userId} does not exist`);
        }
        const uniqueFormID = (0, unique_1.generateUniqueFormID)();
        console.log(uniqueFormID);
        const uploadedDocumentUrls = await Promise.all(documents.map(async (document) => {
            const key = `${userId}/${(0, uuid_1.v4)()}-${document.image.split('/').pop()}`;
            ;
            console.log(key);
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
        const application = await prisma.application.create({
            data: {
                uniqueFormID,
                applicantName,
                applicantDOB,
                mailingAddress,
                contactNumber,
                emailAddress,
                placeOfResidence,
                hometown,
                maritalStatus,
                nextOfKin,
                landLocality,
                siteName,
                plotNumbers,
                totalLandSize,
                streetName,
                landTransferor,
                dateOfOriginalTransfer,
                purposeOfLand,
                contactOfTransferor,
                documents: {
                    createMany: {
                        data: uploadedDocumentUrls
                    }
                },
                payments: {
                    createMany: {
                        data: payments
                    }
                },
                status: 'PENDING',
                User: { connect: { id: userId } }
            },
            include: {
                documents: true,
                payments: true
            }
        });
        res.status(201).json({ message: 'Application submitted successfully', application });
    }
    catch (error) {
        console.error('Error occurred in fillApplicationForm:', error);
        res.status(500).json({ error: error.message || 'An error occurred while processing your request' });
    }
};
exports.fillApplicationForm = fillApplicationForm;
const getFormsCreatedByUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log("Display this, like it is hitting the endpoint", userId);
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const stateForm = await prisma.stateForm.findFirst({
            where: {
                userId: userId,
                status: 'UNUSED'
            }
        });
        console.log(stateForm);
        if (!stateForm) {
            return res.status(404).json({ success: false, message: 'No unused forms found for the user' });
        }
        const forms = await prisma.application.findMany({
            where: {
                userId: userId
            },
            include: {
                documents: true,
                payments: true
            }
        });
        res.status(200).json({ success: true, forms });
    }
    catch (error) {
        console.error('Error occurred while fetching forms:', error);
        res.status(500).json({ success: false, error: 'An error occurred while processing your request' });
    }
};
exports.getFormsCreatedByUser = getFormsCreatedByUser;
const createReport = async (req, res) => {
    try {
        const { email, issue, priority, description } = req.body;
        if (!email || !issue || !priority || !description) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const report = await prisma.report.create({
            data: {
                email,
                issue,
                priority,
                description
            }
        });
        res.status(201).json({ message: 'Report created successfully', report });
    }
    catch (error) {
        console.error('Error occurred while creating report:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.createReport = createReport;
