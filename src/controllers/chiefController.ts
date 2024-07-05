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


export const allevents = async (req: Request, res: Response) => {
  try {


    const allAppointments = await db.appointment.findMany({
      include: {
        inspector: true,
      },
    });

    res.status(200).json({ appointments: allAppointments });
  } catch (error) {
    console.error('Error occurred while fetching appointments:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};

export const userCount = async (req: Request, res: Response) => {
  try {
    const count = await db.user.count();

    res.status(200).json({ userCount: count });
  } catch (error) {
    console.error('Error occurred while fetching user count:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};

export const countApprovedForms = async (req: Request, res: Response) => {
  try {
    const approvedApplicationsCount = await db.application.count({
      where: {
        status: 'APPROVED',
      },
    });

    const approvedOrganizationFormsCount = await db.organizationForm.count({
      where: {
        status: 'APPROVED',
      },
    });

    const totalApprovedCount = approvedApplicationsCount + approvedOrganizationFormsCount;

    res.status(200).json({
      totalApprovedCount,
    });
  } catch (error) {
    console.error('Error occurred while counting approved forms:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};


export const countDeniedForms = async (req: Request, res: Response) => {
  try {
    const deniedApplicationsCount = await db.application.count({
      where: {
        status: 'DENIED',
      },
    });

    const deniedOrganizationFormsCount = await db.organizationForm.count({
      where: {
        status: 'DENIED',
      },
    });

    const totalDeniedCount = deniedApplicationsCount + deniedOrganizationFormsCount;

    res.status(200).json({
      totalDeniedCount,
    });
  } catch (error) {
    console.error('Error occurred while counting denied forms:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};




export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.body; 

    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    const appointment = await db.appointment.findUnique({
      where: { id: Number(id) },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await db.appointment.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error occurred while deleting appointment:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};
