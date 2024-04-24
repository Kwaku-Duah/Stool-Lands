import { Request as ExpressRequest, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { USERNAME_KEY, PASSWORD_KEY } from '../secrets';

const prisma = new PrismaClient();


export interface User {
  id: number;
  role: string;
}

export interface Request extends ExpressRequest {
  user?: User;
}
export const handlePaymentCallback = async (req: Request, res: Response) => {
  try {
    const { Status, Data } = req.body;
    console.log(req.body);

    const { ClientReference, PaymentDetails, Description } = Data;

    if (ClientReference) {
      const updateData: any = {};

      if (Status === 'Success') {
        updateData.status = 'COMPLETED';
        updateData.isPaymentCompleted = true;
        updateData.isServiceCompleted = true;
      } else if (Status === 'Failed') {
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
  } catch (error) {
    console.error('Error handling payment callback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// if the payment failed to update the state to EXPIRED
//  providerDescription taken from the response


export const checkUnusedFormForUser = async (req: Request, res: Response) => {
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
    } else {
      return res.status(200).json({ success: false, message: 'No unused form exists for user' });
    }
  } catch (error) {
    console.error('Error checking unused form for user:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};




export async function checkTransactionStatus(req: Request, res: Response) {
  const { clientReference } = req.body;
  console.log(clientReference)

  try {

    const authString = Buffer.from(USERNAME_KEY + ':' + PASSWORD_KEY).toString('base64');

    console.log(authString)

    const transaction = await prisma.transaction.findFirst({
      where: { clientReference }
    });

    if (!transaction) return res.status(404).json({ success: false, message: "Failed to find transaction" });

    if (transaction.status === 'COMPLETED') return res.json({ success: true });

    if (transaction.status === 'PENDING') {
      const url = `https://api-txnstatus.hubtel.com/transactions/11684/status?clientReference=${clientReference}`;
      const transactionStatusResponse = await axios.get(url, {
        headers: { 'Authorization': 'Basic ' + authString }
      });
      const transactionStatus = transactionStatusResponse.data.status;
      return res.json({ success: true, transactionStatus });
    }

    return res.status(400).json({ success: false, message: "Invalid transaction status" });
  } catch (error) {
    console.error("Error checking transaction status:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}