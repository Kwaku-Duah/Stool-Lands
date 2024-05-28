import { Request, Response } from 'express';
import db from '../dbConfig/db';

export const allUsers = async (req: Request, res: Response) => {
  try {

    const users = await db.user.findMany({
      select: {
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        activeStatus:true
      }
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'An error occurred while fetching users' });
  }
};


export const getAllForms = async (req: Request, res: Response) => {
  try {

    const applicationForms = await db.application.findMany({
      include: { documents: true }
    });


    const organizationForms = await db.organizationForm.findMany({
      include: { documents: true }
    });

    const stateForms = await db.stateForm.findMany();


    const formsWithServiceId = await Promise.all(stateForms.map(async (stateForm) => {
      const transaction = await db.transaction.findFirst({
        where: { clientReference: stateForm.clientReference },
        select: { serviceId: true }
      });

      const serviceId = transaction?.serviceId;

      return {
        ...stateForm,
        serviceId: serviceId
      };
    }));

    const forms = [...applicationForms, ...organizationForms, ...formsWithServiceId];

    res.status(200).json({ success: true, forms });
  } catch (error: any) {
    console.error('Error occurred while fetching forms:', error);
    res.status(500).json({ success: false, error: 'An error occurred while processing your request' });
  }
};

