import { Request as ExpressRequest, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import db from '../dbConfig/db'
import { config } from 'dotenv';

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

export const jointApplicationForm = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log(userId)
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { applicants, landDetails, payments, documents } = req.body;

    if (!Array.isArray(applicants) || !applicants.length) {
      throw new Error('Applicants data should be a non-empty array');
    }

    if (!landDetails || typeof landDetails !== 'object') {
      throw new Error('Land details should be provided as an object');
    }

    if (!Array.isArray(documents)) {
      throw new Error('Documents should be an array');
    }


    const uploadedDocumentUrls = await Promise.all(documents.map(async (document: any) => {
      const key = `organization/${userId}/${uuidv4()}-${document.image.split('/').pop()}`;

      const params = {
        Bucket: process.env.BUCKET_NAME!,
        Key: key,
        Body: document.data,
        ContentType: document.mimetype,
        ContentLength: document.size
      };

      await s3Client.send(new PutObjectCommand(params));

      return {
        type: document.type,
        image: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`
      };
    }));

    const uniqueFormID = uuidv4();

    const applicantNames = applicants.map(applicant => applicant.applicantName);
    const applicantDOBs = applicants.map(applicant => applicant.applicantDOB);

    const application = await db.application.create({
      data: {
        uniqueFormID,
        applicantName: applicantNames.join(' & '),
        applicantDOB: applicantDOBs,
        mailingAddress: applicants.map(applicant => applicant.mailingAddress).join(' & '),
        contactNumber: applicants.map(applicant => applicant.contactNumber).join(' & '),
        emailAddress: applicants.map(applicant => applicant.emailAddress).join(' & '),
        placeOfResidence: applicants.map(applicant => applicant.placeOfResidence).join(' & '),
        hometown: applicants.map(applicant => applicant.hometown).join(' & '),
        nextOfKin: applicants.map(applicant => applicant.nextOfKin).join(' & '),
        maritalStatus: applicants.map(applicant => applicant.maritalStatus).join(' & '), 
        ...landDetails,
        documents: {
          createMany: {
            data: uploadedDocumentUrls
          }
        },
        status: 'PENDING',
        User: { connect: { id: userId } }
      },
      include: {
        documents: true
    }
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error: any) {
    console.error('Error occurred in jointApplicationForm:', error);
    res.status(500).json({ error: error.message || 'An error occurred while processing your request' });
  }
};