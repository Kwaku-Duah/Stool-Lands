import { Request as ExpressRequest, Response } from 'express';
import fetch from 'node-fetch';
import { USERNAME_KEY, PASSWORD_KEY } from '../secrets';
import db from '../dbConfig/db'
import { generateUniqueFormID } from '../utils/unique';
import { MERCHANT_CODE } from '../secrets'


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
 
    const service = await db.payableService.findUnique({
      where: { code: serviceId }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (service.tags.includes('form')) {
      const formToken = generateUniqueFormID();


      const clientReference = generateClientReference();

      await db.stateForm.create({
        data: {
          token: formToken,
          status: 'INACTIVE',
          User: { connect: { id: userId } },
          clientReference: clientReference
        }
      });

      await db.transaction.create({
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

      const returnUrl = `https://xorvey-git-main-gloriatampuris-projects-0969866d.vercel.app/${serviceId}`;
      console.log(returnUrl)

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
          merchantAccountNumber: MERCHANT_CODE,
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