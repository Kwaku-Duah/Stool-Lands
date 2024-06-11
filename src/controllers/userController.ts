import { Request as ExpressRequest, Response } from 'express';
import db from '../dbConfig/db';


export interface User {
  id: number;
  role: string;
}

export interface Request extends ExpressRequest {
  user?: User;
}


export const allUsers = async (req: Request, res: Response) => {
  try {

    const users = await db.user.findMany({
      select: {
        id:true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        activeStatus: true
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



    const forms = [...applicationForms, ...organizationForms];

    res.status(200).json({ success: true, forms });
  } catch (error: any) {
    console.error('Error occurred while fetching forms:', error);
    res.status(500).json({ success: false, error: 'An error occurred while processing your request' });
  }
};





export const specificForms = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userid, 10);
    console.log(userId)


    const applicationForms = await db.application.findMany({
      where: { userId },
      include: { documents: true }
    });

    const organizationForms = await db.organizationForm.findMany({
      where: { userId },
      include: { documents: true }
    });

    const forms = [...applicationForms, ...organizationForms];

    res.status(200).json({ success: true, forms });
  } catch (error: any) {
    console.error('Error occurred while fetching forms:', error);
    res.status(500).json({ success: false, error: 'An error occurred while processing your request' });
  }
};



export const allTickets = async (req: Request, res: Response) => {

  try {
    const tickets = await db.ticket.findMany();

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'No tickets found' });
    }

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Error occurred while fetching tickets:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}


export const userActivate = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Authenticated user required' });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { activeStatus: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }


    if (user.role === 'ADMIN' || user.role === 'SECRETARY') {
      return res.status(403).json({ success: false, message: 'Cannot delete an admin or secretary user' });
    }


    return res.status(200).json({ success: true, message: 'User activated successfully', user });
  } catch (error) {
    console.error('Error occurred while deactivating user:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
  }
};





export const userDeactivate = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Authenticated user required' });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { activeStatus: false },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }


    if (user.role === 'ADMIN' || user.role === 'SECRETARY') {
      return res.status(403).json({ success: false, message: 'Cannot delete an admin or secretary user' });
    }


    return res.status(200).json({ success: true, message: 'User deactivated successfully', user });
  } catch (error) {
    console.error('Error occurred while deactivating user:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
  }
};



export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN' || user.role === 'SECRETARY') {
      return res.status(403).json({ success: false, message: 'Cannot delete an admin or secretary user' });
    }

    const nullifiedUser = await db.user.update({
      where: { id: userId },
      data: {
        name: null!,
        email: null!,
        phoneNumber: null!,
        occupation: null!,
        password: null!,
        changePassword: false,
        role: null!,
        activeStatus: false,
      },
    });

    return res.status(200).json({ success: true, message: 'User nullified successfully', nullifiedUser });
  } catch (error) {
    console.error('Error occurred while nullifying user:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
  }
};