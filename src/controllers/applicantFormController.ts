import { Request as ExpressRequest, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import multer from 'multer';
import db from '../dbConfig/db';

config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const upload = multer();

export interface User {
  id: number;
  role: string;
}

export interface Request extends ExpressRequest {
  user?: User;
}




export const fillApplicationForm = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      applicantName, applicantDOB, mailingAddress, contactNumber,
      emailAddress, placeOfResidence, hometown, maritalStatus,
      nextOfKin, landLocality, siteName, plotNumbers, totalLandSize,
      streetName, landTransferor, dateOfOriginalTransfer, purposeOfLand,
      contactOfTransferor
    } = req.body;


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

    const application = await db.application.create({
      data: {
        uniqueFormID,
        applicantName,
        applicantDOB,
        mailingAddress,
        contactNumber,
        emailAddress,
        placeOfResidence,
        hometown,
        maritalStatus,
        nextOfKin,
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

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error: any) {
    console.error('Error occurred in fillApplicationForm:', error);
    res.status(500).json({ error: error.message || 'An error occurred while processing your request' });
  }
}




export const getFormsCreatedByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const applicationForms = await db.application.findMany({
      where: {
        userId: userId
      },
      include: {
        documents: true
      }
    });

    const organizationForms = await db.organizationForm.findMany({
      where: {
        userId: userId
      },
      include: {
        documents: true
      }
    });

    const stateForms = await db.stateForm.findMany({
      where: {
        userId: userId,
        status: 'UNUSED'
      }
    });


    const formsWithServiceId = await Promise.all(stateForms.map(async (stateForm) => {
      const transaction = await db.transaction.findFirst({
        where: {
          clientReference: stateForm.clientReference
        },
        select: {
          serviceId: true
        }
      });

      const serviceId = transaction?.serviceId;

      return {
        ...stateForm,
        serviceId: serviceId
      };
    }));

    const forms = [...applicationForms, ...organizationForms];
    if (!stateForms || stateForms.length === 0) {

      return res.status(200).json({ success: false, message: 'No unused forms found for the user ', forms: [...formsWithServiceId, ...forms] });
    }

    res.status(200).json({ success: true, forms: [...formsWithServiceId, ...forms] });
  } catch (error: any) {
    console.error('Error occurred while fetching forms:', error);
    res.status(500).json({ success: false, error: 'An error occurred while processing your request' });
  }
};



export const createReport = async (req: Request, res: Response) => {
  try {
    const { email, issue, priority, description } = req.body;

    if (!email || !issue || !priority || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const report = await db.report.create({
      data: {
        email,
        issue,
        priority,
        description
      }
    });

    res.status(201).json({ message: 'Report created successfully', report });
  } catch (error) {
    console.error('Error occurred while creating report:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};