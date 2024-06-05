import { Request as ExpressRequest, Response } from 'express';
import {  ROLE } from '@prisma/client';
import { backroomMessage } from '../services/backRoom';
import db from '../dbConfig/db'
import { generateTemporaryPassword } from '../utils/passworGenerator';
import { hashPassword } from '../utils/hashPassword';

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

