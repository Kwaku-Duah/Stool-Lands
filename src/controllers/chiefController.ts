import { Request, Response } from 'express';
import {  ROLE } from '@prisma/client';
import { backroomMessage } from '../services/backRoom';
import db from '../dbConfig/db'
import { generateTemporaryPassword } from '../utils/passworGenerator';
import { hashPassword } from '../utils/hashPassword';


const generateChiefId = async (): Promise<string> => {
  const existingChiefCount = await db.chief.count();
  const chiefCount = existingChiefCount + 1;
  const chiefId = `SUBCHIEF-${chiefCount.toString().padStart(3, '0')}`;
  return chiefId;
};

// Going to be used for subchief
export const createChief = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber } = req.body;
    

    const temporaryPassword = generateTemporaryPassword()

    const newUser = await db.user.create({
      data: {
        name,
        email,
        phoneNumber,
        occupation:"SUBCHIEF",
        password: temporaryPassword,
        changePassword: true,
        role: ROLE.CHIEF,
      },
    });

    const hashedPassword = await hashPassword(temporaryPassword);

    await db.user.update({
      where: { id: newUser.id },
      data: {
        password: hashedPassword
      }
    });


    const chiefId = await generateChiefId();

    const newChief = await db.chief.create({
      data: {
        email: newUser.email!,
        chiefId,
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


    res.status(201).json({ message: 'SubChief created successfully', chief: newChief });
  } catch (error) {
    console.error('Error occurred while creating chief:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};