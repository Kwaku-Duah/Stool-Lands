import { Request as ExpressRequest, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { generateUniqueFormID } from '../utils/unique';
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
      emailAddress, organizationLogo, landLocality, siteName, plotNumbers, totalLandSize,
      streetName, landTransferor, dateOfOriginalTransfer, purposeOfLand,
      contactOfTransferor, documents
    } = req.body;

    if (!Array.isArray(documents)) {
      throw new Error('Documents should be an array');
    }

    const uniqueFormID = generateUniqueFormID();

    const uploadedDocumentUrls = await Promise.all(documents.map(async (document: any) => {
      const key = `organization/${userId}/${uuidv4()}-${document.image.split('/').pop()}`;

      const params = {
        Bucket: process.env.BUCKET_NAME!,
        Key: key,
        Body: document.data,
        ContentType: document.mimetype
      };

      await s3Client.send(new PutObjectCommand(params));

      return {
        type: document.type,
        image: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`
      };
    }));

    const logoKey = `organization/${userId}/${uuidv4()}-logo.jpg`;
    const logoParams = {
      Bucket: process.env.BUCKET_NAME!,
      Key: logoKey,
      Body: organizationLogo,
      ContentType: 'image/jpeg'
    };
    await s3Client.send(new PutObjectCommand(logoParams));

    const uploadedLogoUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${logoKey}`;

    const organizationForm = await db.organizationForm.create({
      data: {
        uniqueFormID,
        organisationName,
        location,
        mailingAddress,
        contactNumber,
        emailAddress,
        organizationLogo: uploadedLogoUrl,
        landLocality,
        siteName,
        plotNumbers,
        totalLandSize,
        streetName,
        landTransferor,
        dateOfOriginalTransfer,
        purposeOfLand,
        contactOfTransferor,
        documents: {
          createMany: {
            data: uploadedDocumentUrls
          }
        },
        status: 'PENDING',
        User: { connect: { id: userId } }
      }
    });

    res.status(201).json({ message: 'Organization form submitted successfully', organizationForm });
  } catch (error: any) {
    console.error('Error occurred in createOrganizationForm:', error);
    res.status(500).json({ error: error.message || 'An error occurred while processing your request' });
  }
};
