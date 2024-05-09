import { Request, Response } from 'express';
import { hashSync } from 'bcrypt';
import {  ROLE } from '@prisma/client';
import { backroomMessage } from '../services/backRoom';
import db from '../dbConfig/db'



const generateChiefId = async (): Promise<string> => {
  const existingChiefCount = await db.chief.count();
  const chiefCount = existingChiefCount + 1;
  const chiefId = `CHIEF-${chiefCount.toString().padStart(3, '0')}`;
  return chiefId;
};

export const createChief = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, occupation, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const hashedPassword = hashSync(newPassword, 10);

    const newUser = await db.user.create({
      data: {
        name,
        email,
        phoneNumber,
        occupation,
        password: hashedPassword,
        role: ROLE.CHIEF,
      },
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

    const link = `${frontendURL}/resetPswd/${user?.id}`
    console.log(link)

    await backroomMessage(name, email, phoneNumber,newPassword,occupation,link);


    res.status(201).json({ message: 'Chief created successfully', chief: newChief });
  } catch (error) {
    console.error('Error occurred while creating chief:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};