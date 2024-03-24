import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../dbConfig/db';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secrets';
import { encode } from 'base64-url';
import { sendPasswordResetEmail } from '../services/forgotPassword';


export const forgotReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const errors: { msg: string }[] = [];
    const user = await db.user.findFirst({
      where: {
        email: email
      }
    });

    if (!user) {
      errors.push({ msg: 'This email does not have an account' });
      res.status(400).json({ errors });
    } else {
      const payload = {
        email: user.email,
        id: user.id
      };
      const token = jwt.sign(payload, JWT_SECRET);
      const encodedToken = encode(token);

      const frontendURL = process.env.FRONTEND_ORIGIN || '';

      const link = `${frontendURL}/resetPswd/${user.id}/${encodedToken}`;

      await sendPasswordResetEmail(user.username, user.email, link); // Ensure email is passed as the second argument
      console.log("user email", user.email)

      res.status(200).json({ message: 'Password reset link has been sent to your email', link });
    }
  } catch (error: unknown) {
    const statusCode = (error as { status: number }).status || 400;
    res.status(statusCode).json({ message: (error as Error).message || 'Bad Request' });
  }
};




export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;

    if (!userId || !newPassword || !confirmPassword) {
      throw new Error('userId, newPassword, and confirmPassword are required');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('New password and confirm password do not match');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        changePassword: false
      }
    });

    res.status(200).json({ message: 'Password changed successfully', success: true });
  } catch (error: unknown) {
    const statusCode = (error as { status?: number }).status || 400;
    res.status(statusCode).json({ message: (error as Error).message || 'Bad Request' });
  }
};