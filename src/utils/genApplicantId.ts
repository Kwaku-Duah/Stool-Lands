import { ROLE } from '@prisma/client';
import db from '../dbConfig/db';

export const generateApplicantID = async (): Promise<string> => {
  try {
    // Find the last applicant
    const lastApplicant = await db.user.findFirst({
      where: { role: ROLE.APPLICANT },
      orderBy: { staffId: 'desc' }
    });

    // Get the last user's ID or default to 0
    const lastUserId = lastApplicant ? parseInt(lastApplicant.staffId.split('-')[1]) : 0;

    // Increment the last user's ID
    const newUserId = lastUserId + 1;

    // Generate a new applicant ID
    const newApplicantId = `APPLICANT-${String(newUserId).padStart(5, '0')}`;

    return newApplicantId;
  } catch (error) {
    // Handle any errors
    console.error("Error generating applicant ID:", error);
    throw new Error("Failed to generate applicant ID");
  }
};
