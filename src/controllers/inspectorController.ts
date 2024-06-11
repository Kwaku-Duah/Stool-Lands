import { Request as ExpressRequest, Response } from 'express';
import {  ROLE } from '@prisma/client';
import { backroomMessage } from '../services/backRoom';
import db from '../dbConfig/db'
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import multer from 'multer';
import { generateTemporaryPassword } from '../utils/passworGenerator';
import { hashPassword } from '../utils/hashPassword';

config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const upload = multer();




const generateInspectorId = async (): Promise<string> => {
  const existingInspectorCount = await db.inspector.count();
  const inspectorCount = existingInspectorCount + 1;
  const inspectorId = `INSPECTOR-${inspectorCount.toString().padStart(3, '0')}`;
  return inspectorId;
};


export interface User {
  id: number;
  role: string;
}

export interface Request extends ExpressRequest {
  user?: User;
}
export const createInspector = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber } = req.body;

    const temporaryPassword = generateTemporaryPassword()

    const newUser = await db.user.create({
      data: {
        name,
        email,
        phoneNumber,
        occupation: 'INSPECTOR',
        password: temporaryPassword,
        changePassword: true,
        role: ROLE.INSPECTOR,
      },
    });


    const hashedPassword = await hashPassword(temporaryPassword);

    await db.user.update({
      where: { id: newUser.id },
      data: {
        password: hashedPassword
      }
    });

    const inspectorId = await generateInspectorId();

    const newInspector = await db.inspector.create({
      data: {
        email: newUser.email!,
        inspectorId,
      },
    });

    const user = await db.user.findFirst({
      where: {
        email: email
      }
    });

    const frontendURL = process.env.FRONTEND_ORIGIN || '';

    const link = `${frontendURL}/login`
    console.log(link)
 
    await backroomMessage(name, email, phoneNumber,temporaryPassword,user!.occupation,link);

    res.status(201).json({ message: 'Inspector created successfully', inspector: newInspector });
  } catch (error) {
    console.error('Error occurred while creating inspector:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};


// inspector uploading form proof
export const inspectProof = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userEmail = user.email;

    const inspector = await db.inspector.findUnique({
      where: { email: userEmail! },
      select: { inspectorId: true }
    });

    if (!inspector) {
      return res.status(404).json({ message: 'Inspector not found' });
    }

    const inspectorId = inspector.inspectorId;

    const { uniqueFormID } = req.body;

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

    const proof = await db.inspectUpload.create({
      data: {
        uniqueFormID,
        inspectorId,
        documents: {
          createMany: {
            data: uploadedDocumentUrls
          }
        },
      }
    });

    return res.status(200).json({success: true, proof});

  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};