import { Request as ExpressRequest, Response } from 'express';
import db from '../dbConfig/db';

export interface User {
  id: number;
  role: string;
}

export interface Request extends ExpressRequest {
  user?: User;
}





export const assignInspector = async (req: Request, res: Response) => {
  const { uniqueFormID, email } = req.body;

  try {
      const userId = req.user?.id;
      if (!userId) {
          return res.status(401).json({ message: 'User not authenticated' });
      }

      const user = await db.user.findUnique({
          where: { id: userId },
      });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const userEmail = user.email;

      const secretary = await db.secretary.findUnique({
          where: { email: userEmail! },
      });
      if (!secretary) {
          return res.status(404).json({ success: false, message: 'Secretary not found for the user' });
      }

      const secretaryId = secretary.secretaryId;

      const inspector = await db.inspector.findUnique({
          where: { email },
      });
      if (!inspector) {
          return res.status(403).json({ success: false, message: 'User is not an inspector' });
      }

      const assignedApplication = await db.application.findUnique({
          where: { uniqueFormID },
          include: { documents: true }
      });
      const assignedOrganizationForm = await db.organizationForm.findUnique({
          where: { uniqueFormID },
          include: { documents: true }
      });

      if (!assignedApplication && !assignedOrganizationForm) {
          return res.status(404).json({ success: false, message: 'Form not found' });
      }

      const createdAssignment = await db.assignment.create({
          data: {
              uniqueFormID,
              secretaryId,
              isAssigned: true,
          },
      });

      if (assignedApplication) {
          await db.application.update({
              where: { uniqueFormID },
              data: {
                  state: 'ASSIGNED',
              },
          });
      } else if (assignedOrganizationForm) {
          await db.organizationForm.update({
              where: { uniqueFormID },
              data: {
                  state: 'ASSIGNED',
              },
          });
      }

      const invitation = await db.invitation.create({
          data: {
              assignmentId: createdAssignment.uniqueFormID,
              inspectors: {
                  connect: { inspectorId: inspector.inspectorId },
              },
          },
      });

      const assignedForm = assignedApplication || assignedOrganizationForm;

      return res.status(200).json({ success: true, message: 'Form assigned successfully', invitation, assignedForm });
  } catch (error) {
      console.error('Error occurred while assigning form:', error);
      return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
  }
};









  
  export const inspectorAssign = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
  
      const user = await db.user.findUnique({
        where: { id: userId },
      });
  
      if (!user || !user.email) {
        return res.status(404).json({ success: false, message: 'User not found or email is missing' });
      }
  
      const inspector = await db.inspector.findUnique({
        where: { email: user.email },
      });
  
      if (!inspector) {
        return res.status(404).json({ success: false, message: 'Inspector not found' });
      }
  
      const invitations = await db.invitation.findMany({
        where: {
          inspectors: {
            some: {
              inspectorId: inspector.inspectorId,
            },
          },
        },
        include: {
          Assignment: true,
        },
      });
  
      const forms: any[] = [];
      for (const invitation of invitations) {
        const assignmentId = invitation.Assignment?.uniqueFormID;
        if (assignmentId) {
          const applicationForm = await db.application.findUnique({
            where: { uniqueFormID: assignmentId },
            include: { documents: true }
          });
          const organizationForm = await db.organizationForm.findUnique({
            where: { uniqueFormID: assignmentId },
            include: { documents: true }
          });
          if (applicationForm) {
            forms.push(applicationForm);
          }
          if (organizationForm) {
            forms.push(organizationForm);
          }
        }
      }
  
      return res.status(200).json({ success: true, forms });
    } catch (error) {
      console.error('Error occurred while fetching inspector assignments:', error);
      return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
  };
  
