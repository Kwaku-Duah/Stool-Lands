import { Request, Response } from 'express';
import fetch from 'node-fetch';

export const initiatePayment = async (req: Request, res: Response) => {
  const { phoneNumber, serviceId, customerName } = req.body;

  if (!phoneNumber || !serviceId || !customerName) {
    return res.status(400).json({ error: 'phoneNumber, serviceId, and customerName are required' });
  }

  const url = 'https://payproxyapi.hubtel.com/items/initiate';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'Basic YXV1dXViYnU6dm5wdWlmZm0gIA=='
    },
    body: JSON.stringify({
      phoneNumber,
      serviceId,
      customerName
    })
  };

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();

    // Check if the response is successful
    if (response.ok) {
      // If successful, send the response to the client
      res.json(responseData);
    } else {
      // If not successful, handle the error
      throw new Error(responseData.error || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


{
  "message": "Successfully generated checkout url",
  "code": "200",
  "isSuccessful": true,
  "data": {
    "referenceId": "95d222c4ecca4de8a9ed0d78828a5f49",
    "invoiceId": "wHCmGap",
    "paymentStatus": "pending",
    "checkoutUrl": "https://pay.hubtel.com/daefe2531370489e9d0a40d29aedab24/direct"
  },
  "errors": null
}
 RESPONSE FORMAT



model payableService {
  id        Int      @id @default(autoincrement())
  code      String   @unique
  name      String
  amount    Decimal
  currency  String
  tags      String[] 
  description String
}


model Transaction {
  id                   String      @id
  paymentReferenceId   String
  status               String
  serviceId            String
  description          String
  createdAt            DateTime
  customerName         String
  paymentProvider      String
  phoneNumber          String
  isPaymentCompleted   Boolean
  isServiceCompleted   Boolean
  amount               Float
  paymentPlatformSource String
}


// JSONB type is not supported directly in Prisma, so we use String[] instead JSONB is not supported!
CallbackURL for an endpoint---- Pass it to receive money a success or failure, then the frontend will receive feedback from that...




**Firstly**
Frontend sends the name, serviceId and phoneNumber to me
and then based on the serviceId, I will figure out how the formtype and how much is suppposed to be paid...

and then send a checkoutURL to her and then she'll....


then after client makes payment or cancels it, have another endpoint that will receive a callback from hubtel....to confirm status check, if success
use the clientReference to fetch the transaction status and update the status of that transaction [success/failed] 
create a transaction before firing the receive money request....
an endpoint to check the status of the transaction..... GET, client reference ,if it exists and if it is success

post endpoint should expect response of the the.....format....