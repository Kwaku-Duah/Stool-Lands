import { Request as ExpressRequest, Response } from 'express';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { USERNAME_KEY, PASSWORD_KEY } from '../secrets';
import db from '../dbConfig/db'
import { generateUniqueFormID } from '../utils/unique';

const prisma = new PrismaClient();

function generateClientReference() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString();
  return timestamp + random;
}

export interface User {
  id: number;
  role: string;
}

export interface Request extends ExpressRequest {
  user?: User;
}

export const createTransaction = async (req: Request, res: Response) => {
  const { serviceId, customerName, phoneNumber } = req.body;

  try {
    const userId = req.user?.id;
    console.log("This is the userid", userId)
    const service = await prisma.payableService.findUnique({
      where: { code: serviceId }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (service.tags.includes('form')) {
      const formToken = generateUniqueFormID();


      const clientReference = generateClientReference();

      await prisma.stateForm.create({
        data: {
          token: formToken,
          status: 'INACTIVE',
          User: { connect: { id: userId } },
          clientReference: clientReference
        }
      });

      await prisma.transaction.create({
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


      const authString = Buffer.from(USERNAME_KEY + ':' + PASSWORD_KEY).toString('base64');

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
          callbackUrl: 'https://webhook.site/9c84d2a4-868d-43b8-a185-ed1d3f2ad904',
          returnUrl: 'http://localhost:5000/hello',
          cancellationUrl: 'http://localhost:5000/payments/callback',
          merchantAccountNumber: '11684',
          clientReference,
          customerName,
          phoneNumber
        })
      };
      console.log('Request:', options);
      const response = await fetch(url, options);
      const responseData = await response.json();

      res.json(responseData);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Provider description from the webhook
// Provider to the transaction table
// Expired to the transaction-