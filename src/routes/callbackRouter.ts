import express from 'express';
import { Router } from 'express'
import { handlePaymentCallback,checkTransactionStatus } from '../controllers/transactionController';


const callbackRoute: Router = express.Router();

// Route for handling payment callbacks
callbackRoute.post('/callback', handlePaymentCallback);
callbackRoute.post('/state',checkTransactionStatus)

export default callbackRoute;