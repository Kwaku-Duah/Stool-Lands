import { Request, Response } from 'express';
import { hashSync } from 'bcrypt';
import { ROLE } from '@prisma/client';
import { backroomMessage } from '../services/backRoom';
import db from '../dbConfig/db'
import { generateTemporaryPassword } from '../utils/passworGenerator';
import { hashPassword } from '../utils/hashPassword';

const generateSecretaryId = async (): Promise<string> => {
  const existingSecretaryCount = await db.secretary.count();
  const secretaryCount = existingSecretaryCount + 1;
  const secretaryId = `SECRETARY-${secretaryCount.toString().padStart(3, '0')}`;
  return secretaryId;
};

export const createSecretary = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber} = req.body;

    const temporaryPassword = generateTemporaryPassword()

    const newUser = await db.user.create({
      data: {
        name,
        email,
        phoneNumber,
        occupation:"SECRETARY",
        password: temporaryPassword,
        changePassword:true,
        role: ROLE.SECRETARY,
      },
    });

    const hashedPassword = await hashPassword(temporaryPassword);

    await db.user.update({
      where: { id: newUser.id },
      data: {
        password: hashedPassword
      }
    });

    const secretaryId = await generateSecretaryId();

    const newSecretary = await db.secretary.create({
      data: {
        email: newUser.email!,
        secretaryId,
      },
    });

    const user = await db.user.findFirst({
      where: {
        email: email
      }
    });

    const frontendURL = process.env.FRONTEND_ORIGIN || '';

    const link = `${frontendURL}/login`


    await backroomMessage(name, email, phoneNumber,temporaryPassword,user!.occupation,link);


    res.status(201).json({ message: 'Secretary created successfully', secretary: newSecretary });
  } catch (error) {
    console.error('Error occurred while creating secretary:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};
