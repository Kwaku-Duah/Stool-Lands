"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTransactionStatus = exports.checkUnusedFormForUser = exports.handlePaymentCallback = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const secrets_1 = require("../secrets");
const prisma = new client_1.PrismaClient();
const handlePaymentCallback = async (req, res) => {
    try {
        const { Status, Data } = req.body;
        console.log(req.body);
        const { ClientReference, PaymentDetails, Description } = Data;
        if (ClientReference) {
            const updateData = {};
            if (Status === 'Success') {
                updateData.status = 'COMPLETED';
                updateData.isPaymentCompleted = true;
                updateData.isServiceCompleted = true;
            }
            else if (Status === 'Failed') {
                updateData.status = 'FAILED';
            }
            if (PaymentDetails) {
                updateData.MobileMoneyNumber = PaymentDetails.MobileMoneyNumber || null;
                updateData.PaymentType = PaymentDetails.PaymentType || null;
                updateData.Channel = PaymentDetails.Channel || null;
            }
            updateData.ProviderDescription = Description;
            await prisma.transaction.update({
                where: { clientReference: ClientReference },
                data: updateData
            });
            await prisma.stateForm.update({
                where: { clientReference: ClientReference },
                data: { status: Status === 'Success' ? 'UNUSED' : 'EXPIRED' }
            });
        }
        const successMessage = Status === 'Success' ? 'Payment callback received successfully' : 'Payment callback failed';
        res.status(200).json({ success: Status === 'Success', message: successMessage });
    }
    catch (error) {
        console.error('Error handling payment callback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.handlePaymentCallback = handlePaymentCallback;
// if the payment failed to update the state to EXPIRED
//  providerDescription taken from the response
const checkUnusedFormForUser = async (req, res) => {
    const userId = req.user?.id;
    try {
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const stateForm = await prisma.stateForm.findFirst({
            where: { userId, status: 'UNUSED' }
        });
        if (stateForm) {
            return res.status(200).json({ success: true, message: 'Unused form exists for user' });
        }
        else {
            return res.status(404).json({ success: false, message: 'No unused form exists for user' });
        }
    }
    catch (error) {
        console.error('Error checking unused form for user:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.checkUnusedFormForUser = checkUnusedFormForUser;
async function checkTransactionStatus(req, res) {
    const { clientReference } = req.body;
    console.log(clientReference);
    try {
        const authString = Buffer.from(secrets_1.USERNAME_KEY + ':' + secrets_1.PASSWORD_KEY).toString('base64');
        const transaction = await prisma.transaction.findFirst({
            where: { clientReference }
        });
        if (!transaction)
            return res.status(404).json({ success: false, message: "Failed to find transaction" });
        if (transaction.status === 'COMPLETED')
            return res.json({ success: true, message: "Successful transaction" });
        if (transaction.status === 'PENDING') {
            const url = `https://api-txnstatus.hubtel.com/transactions/11684/status?clientReference=${clientReference}`;
            const transactionStatusResponse = await axios_1.default.get(url, {
                headers: { 'Authorization': 'Basic ' + authString }
            });
            const transactionStatus = transactionStatusResponse.data.status;
            return res.json({ success: true, transactionStatus });
        }
        return res.status(400).json({ success: false, message: "Invalid transaction status" });
    }
    catch (error) {
        console.error("Error checking transaction status:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
exports.checkTransactionStatus = checkTransactionStatus;
