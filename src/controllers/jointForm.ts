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

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { applicants, landDetails } = req.body;

    if (!Array.isArray(applicants) || !applicants.length) {
      throw new Error('Applicants data should be a non-empty array');
    }

    if (!landDetails || typeof landDetails !== 'object') {
      throw new Error('Land details should be provided as an object');
    }

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


    const applicantNames = applicants.map(applicant => applicant.applicantName);
    const applicantDOBs = applicants.map(applicant => applicant.applicantDOB);

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


    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error: any) {
    console.error('Error occurred in jointApplicationForm:', error);
    res.status(500).json({ error: error.message || 'An error occurred while processing your request' });
  }
};