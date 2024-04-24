import { Request, Response } from 'express';
import { hashSync } from 'bcrypt';
import { PrismaClient,ROLE } from '@prisma/client';
import { backroomMessage } from '../services/backRoom';

const prisma = new PrismaClient();

const generateSecretaryId = async (): Promise<string> => {
  const existingSecretaryCount = await prisma.secretary.count();
  const secretaryCount = existingSecretaryCount + 1;
  const secretaryId = `SECRETARY-${secretaryCount.toString().padStart(3, '0')}`;
  return secretaryId;
};

export const createSecretary = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, occupation, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const hashedPassword = hashSync(newPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        occupation,
        password: hashedPassword,
        role: ROLE.SECRETARY,
      },
    });

    const secretaryId = await generateSecretaryId();

    const newSecretary = await prisma.secretary.create({
      data: {
        email: newUser.email!,
        secretaryId,
      },
    });

    const user = await prisma.user.findFirst({
      where: {
        email: email
      }
    });

    const frontendURL = process.env.FRONTEND_ORIGIN || '';

    const link = `${frontendURL}/resetPswd/${user?.id}`
    console.log("frontend URL",link)
    await backroomMessage(name, email, phoneNumber,newPassword,occupation,link);


    res.status(201).json({ message: 'Secretary created successfully', secretary: newSecretary });
  } catch (error) {
    console.error('Error occurred while creating secretary:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};
