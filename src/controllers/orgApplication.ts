import { Request as ExpressRequest, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import db from '../dbConfig/db'

config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export interface User {
  id: number;
  role: string;
}

export interface Request extends ExpressRequest {
  user?: User;
}

export const createOrganizationForm = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log(userId);

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      organisationName, location, mailingAddress, contactNumber,
      emailAddress, landLocality, siteName, plotNumbers, totalLandSize,
      streetName, landTransferor, dateOfOriginalTransfer, purposeOfLand,
      contactOfTransferor
    } = req.body;

    // Check if any file is uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No documents uploaded' });
    }


    const uploadedDocumentUrls = await Promise.all(
      Object.values(req.files).map(async (file: any) => {
        const key = `${userId}/${uuidv4()}-${file.originalname}`;
        const params = {
          Bucket: process.env.BUCKET_NAME!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype
        };

        await s3Client.send(new PutObjectCommand(params));

        return {
          url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`
        };
      })
    );



    const endpoint = req.originalUrl;
    console.log(endpoint)
    const type = endpoint.includes('org-apply') ? 'organization' :
                 endpoint.includes('joint-apply') ? 'joint' : 'individual';

    const stateForms = await db.stateForm.findMany({
      where: { userId, status: 'UNUSED' },
      select: {
        id: true,
        clientReference: true,
        token: true,
      }
    });

    let validForm = null;

    for (const stateForm of stateForms) {
      const transaction = await db.transaction.findFirst({
        where: {
          clientReference: stateForm.clientReference,
          serviceId: type
        },
        select: {
          serviceId: true,
        }
      });

      if (transaction?.serviceId === type) {
        validForm = stateForm;

        // Update the status of the state form to 'USED'
        await db.stateForm.update({
          where: { id: stateForm.id },
          data: { status: 'USED' }
        });

        break;
      }
    }

    if (!validForm) {
      return res.status(404).json({ message: 'No valid forms found for the specified type' });
    }

    const uniqueFormID = validForm.token;

    const organizationForm = await db.organizationForm.create({
      data: {
        uniqueFormID,
        organisationName,
        location,
        mailingAddress,
        contactNumber,
        emailAddress,
        landLocality,
        siteName,
        plotNumbers,
        totalLandSize,
        streetName,
        landTransferor,
        dateOfOriginalTransfer,
        purposeOfLand,
        contactOfTransferor,
        type,
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

    res.status(201).json({ message: 'Organization form submitted successfully', organizationForm });
  } catch (error: any) {
    console.error('Error occurred in createOrganizationForm:', error);
    res.status(500).json({ error: error.message || 'An error occurred while processing your request' });
  }
};