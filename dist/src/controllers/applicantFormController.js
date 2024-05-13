"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReport = exports.getFormsCreatedByUser = exports.fillApplicationForm = void 0;
const uuid_1 = require("uuid");
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = require("dotenv");
const multer_1 = __importDefault(require("multer"));
const db_1 = __importDefault(require("../dbConfig/db"));
(0, dotenv_1.config)();
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const upload = (0, multer_1.default)();
const fillApplicationForm = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { applicantName, applicantDOB, mailingAddress, contactNumber, emailAddress, placeOfResidence, hometown, maritalStatus, nextOfKin, landLocality, siteName, plotNumbers, totalLandSize, streetName, landTransferor, dateOfOriginalTransfer, purposeOfLand, contactOfTransferor, documents } = req.body;
        console.log(req.body);
        if (!Array.isArray(documents)) {
            throw new Error('Documents should be an array');
        }
        const existingUser = await db_1.default.user.findUnique({
            where: { id: userId }
        });
        console.log(existingUser);
        if (!existingUser) {
            throw new Error(`User with ID ${userId} does not exist`);
        }
        upload.array('documents')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: "Nothing is been uploaded" });
            }
            const documents = req.files;
            console.log("ARE DOCUMENTS PARSED", documents);
            if (!Array.isArray(documents) || documents.length === 0) {
                return res.status(400).json({ error: 'No documents uploaded' });
            }
            const uploadedDocumentUrls = await Promise.all(documents.map(async (document) => {
                const key = `${userId}/${(0, uuid_1.v4)()}-${document.originalname}`;
                const params = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: key,
                    Body: document.buffer,
                    ContentType: document.mimetype
                };
                await s3Client.send(new client_s3_1.PutObjectCommand(params));
                return {
                    type: document.type,
                    url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`
                };
            }));
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
            const application = await db_1.default.application.create({
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
                    type: "individual",
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
            await db_1.default.stateForm.update({
                where: {
                    id: stateForm.id
                },
                data: {
                    status: 'USED'
                }
            });
            res.status(201).json({ message: 'Application submitted successfully', application });
        });
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
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const stateForms = await db_1.default.stateForm.findMany({
            where: {
                userId: userId,
                status: 'UNUSED'
            }
        });
        if (!stateForms || stateForms.length === 0) {
            return res.status(404).json({ success: false, message: 'No unused forms found for the user' });
        }
        const formsWithServiceId = await Promise.all(stateForms.map(async (stateForm) => {
            const transaction = await db_1.default.transaction.findFirst({
                where: {
                    clientReference: stateForm.clientReference
                },
                select: {
                    serviceId: true
                }
            });
            const serviceId = transaction?.serviceId;
            return {
                ...stateForm,
                serviceId: serviceId
            };
        }));
        const applicationForms = await db_1.default.application.findMany({
            where: {
                userId: userId
            },
            include: {
                documents: true
            }
        });
        const organizationForms = await db_1.default.organizationForm.findMany({
            where: {
                userId: userId
            },
            include: {
                documents: true
            }
        });
        const forms = [...applicationForms, ...organizationForms];
        res.status(200).json({ success: true, forms: [...formsWithServiceId, ...forms] });
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
        const report = await db_1.default.report.create({
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
