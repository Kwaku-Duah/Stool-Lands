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
      include: {
        documents: true,
      },
    });

    const organizationForms = await db.organizationForm.findMany({
      include: {
        documents: true,
      },
    });

    const forms = [...applicationForms, ...organizationForms];

    const formsWithInspectorsAndProofs = await Promise.all(
      forms.map(async (form) => {
        const assignment = await db.assignment.findFirst({
          where: {
            uniqueFormID: form.uniqueFormID,
          },
          include: {
            invitations: {
              include: {
                inspectors: {
                  include: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const inspectorName =
          assignment?.invitations[0]?.inspectors[0]?.user?.name || null;

        let proofDocuments = null;
        let rejectReason = null;

        if (form.status === 'APPROVED') {
          const proof = await db.inspectUpload.findFirst({
            where: { uniqueFormID: form.uniqueFormID },
            include: { documents: true },
          });
          proofDocuments = proof?.documents || null;
        }

        if (form.status === 'DENIED') {
          const reason = await db.reason.findFirst({
            where: { uniqueFormID: form.uniqueFormID },
            select: { reject: true },
          });
          rejectReason = reason?.reject || null;
        }

        return {
          ...form,
          inspectorName,
          proofDocuments,
          rejectReason,
        };
      })
    );

    res.status(200).json({ success: true, forms: formsWithInspectorsAndProofs });
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
    const tickets = await db.ticket.findMany({
      include: {
        replies: true
      }
    });

    if (tickets.length === 0) {
      return res.status(200).json({ message: 'No tickets yet' });
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


export const allInspectors = async (req:Request, res:Response) => {
  try {
    const inspectors = await db.user.findMany({
      where: {
        role: 'INSPECTOR'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    res.status(200).json(inspectors);
  } catch (error) {
    console.error('Error fetching inspectors:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};