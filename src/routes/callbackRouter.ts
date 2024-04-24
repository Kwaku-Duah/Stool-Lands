import express from 'express';
import { Router } from 'express'
import { handlePaymentCallback,checkTransactionStatus,checkUnusedFormForUser } from '../controllers/transactionController';
import { authMiddleware } from '../middleWares/authMiddleware';

const callbackRoute: Router = express.Router();

// Route for handling payment callbacks
callbackRoute.post('/callback', handlePaymentCallback);
callbackRoute.get('/exist',authMiddleware,checkUnusedFormForUser)
callbackRoute.get('/state',checkTransactionStatus)

export default callbackRoute;