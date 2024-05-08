import { Request as ExpressRequest, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { generateUniqueFormID } from '../utils/unique';
import db from '../dbConfig/db';

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
export const fillApplicationForm = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log(userId)

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }



    const {
      applicantName, applicantDOB, mailingAddress, contactNumber,
      emailAddress, placeOfResidence, hometown, maritalStatus,
      nextOfKin, landLocality, siteName, plotNumbers, totalLandSize,
      streetName, landTransferor, dateOfOriginalTransfer, purposeOfLand,
      contactOfTransferor, documents
    } = req.body;

    if (!Array.isArray(documents)) {
      throw new Error('Documents should be an array');
    }


    const existingUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      throw new Error(`User with ID ${userId} does not exist`);
    }

    const uniqueFormID = generateUniqueFormID();
    console.log(uniqueFormID)

    const uploadedDocumentUrls = await Promise.all(documents.map(async (document: any) => {
      const key = `${userId}/${uuidv4()}-${document.image.split('/').pop()}`;
      ;

      console.log(key)
      const params = {
        Bucket: process.env.BUCKET_NAME,
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
        type: "individual",
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
};

// shows if user has existing forms and if yes,displays the filled form
export const getFormsCreatedByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const stateForm = await db.stateForm.findFirst({
      where: {
        userId: userId,
        status: 'UNUSED'
      }
    });

    if (!stateForm) {
      return res.status(404).json({ success: false, message: 'No unused forms found for the user' });
    }

   const transaction = await db.transaction.findFirst({
      where: {
        userId: userId
      },
      select: {
        serviceId: true
      }
    });

    const serviceId = transaction?.serviceId;
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

  const forms = [...applicationForms, ...organizationForms];
  console.log(forms)

  const formsWithTypes = forms.map(form => {
      if (form.formStatus === 'FILLED') {
          return form;
      } else {
          return { id: form.id, type: form.type, formStatus: form.formStatus };
      }
  });

  res.status(200).json({ success: true, forms: formsWithTypes, serviceId: serviceId });
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