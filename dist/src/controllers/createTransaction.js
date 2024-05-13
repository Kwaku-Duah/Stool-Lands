"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const secrets_1 = require("../secrets");
const db_1 = __importDefault(require("../dbConfig/db"));
const unique_1 = require("../utils/unique");
const secrets_2 = require("../secrets");
function generateClientReference() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString();
    return timestamp + random;
}
const createTransaction = async (req, res) => {
    const { serviceId, customerName, phoneNumber } = req.body;
    try {
        const userId = req.user?.id;
        const service = await db_1.default.payableService.findUnique({
            where: { code: serviceId }
        });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        if (service.tags.includes('form')) {
            const formToken = (0, unique_1.generateUniqueFormID)();
            const clientReference = generateClientReference();
            await db_1.default.stateForm.create({
                data: {
                    token: formToken,
                    status: 'INACTIVE',
                    User: { connect: { id: userId } },
                    clientReference: clientReference
                }
            });
            await db_1.default.transaction.create({
                data: {
                    status: 'PENDING',
                    clientReference,
                    description: service.description,
                    createdAt: new Date(),
                    customerName,
                    phoneNumber,
                    User: { connect: { id: userId } },
                    serviceId,
                    paymentProvider: 'Hubtel',
                    isPaymentCompleted: false,
                    isServiceCompleted: false,
                    amount: service.amount,
                    MobileMoneyNumber: null,
                    PaymentType: null,
                    Channel: null,
                    ProviderDescription: 'Payment details not available yet'
                }
            });
            const authString = Buffer.from(secrets_1.USERNAME_KEY + ':' + secrets_1.PASSWORD_KEY).toString('base64');
            const returnUrl = `https://xorvey-git-main-gloriatampuris-projects-0969866d.vercel.app/${serviceId}`;
            console.log(returnUrl);
            const url = 'https://payproxyapi.hubtel.com/items/initiate';
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + authString
                },
                body: JSON.stringify({
                    totalAmount: service.amount,
                    description: service.description,
                    callbackUrl: 'https://pakyi-w1wnypb2.b4a.run/transaction/callback',
                    returnUrl,
                    cancellationUrl: 'https://xorvey-git-main-gloriatampuris-projects-0969866d.vercel.app',
                    merchantAccountNumber: secrets_2.MERCHANT_CODE,
                    clientReference,
                    customerName,
                    phoneNumber
                })
            };
            console.log('Request:', options);
            const response = await (0, node_fetch_1.default)(url, options);
            const responseData = await response.json();
            res.json(responseData);
        }
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createTransaction = createTransaction;
