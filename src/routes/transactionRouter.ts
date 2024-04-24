import express from 'express';
import { Router } from 'express'
import { createTransaction } from '../controllers/createTransaction';
import { authMiddleware } from '../middleWares/authMiddleware';


const transactionRoute: Router = express.Router();

transactionRoute.post('/transactions',[authMiddleware], createTransaction);

export default transactionRoute;
