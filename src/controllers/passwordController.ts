import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../dbConfig/db';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secrets';
import { encode } from 'base64-url';
import { sendPasswordResetEmail } from '../services/forgotPassword';
import { sendOTP, verifyOTP } from '../services/sendOTP';
import { resendOTP } from '../services/resendOTP';


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
      const token = jwt.sign(payload, JWT_SECRET!);
      const encodedToken = encode(token);

      const frontendURL = process.env.FRONTEND_ORIGIN || '';

      const link = `${frontendURL}/resetPswd/${user.id}/${encodedToken}`;

      await sendPasswordResetEmail(user.name, email, link);
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

    // Ensure password meets complexity requirements
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new Error('Password must contain at least 8 characters including letters, numbers, and special symbols');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      }
    });

    res.status(200).json({ message: 'Password changed successfully', success: true });
  } catch (error: unknown) {
    const statusCode = (error as { status?: number }).status || 400;
    res.status(statusCode).json({ message: (error as Error).message || 'Bad Request' });
  }
};


export const OTPSend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber } = req.body;
    
    const user = await db.user.findFirst({
      where: {
        phoneNumber
      }
    });

    if (!user) {
      res.status(400).json({ error: 'INVALID_PHONE_NUMBER', message: 'Phone number does not exist' });
      return;
    }
    
    const otpResponse = await sendOTP(phoneNumber);
    if (!otpResponse) {
      throw new Error('Error sending OTP');
    }
    console.log('OTP sent successfully');

    const { requestId, prefix } = otpResponse;

    res.json({ userId: user.id,requestId, prefix });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error || 'Error sending OTP' });
  }
};


export const verifyOTPController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { requestId, prefix, code } = req.body;
    console.log(req.body)

    const isOTPVerified = await verifyOTP(requestId, prefix, code);
    console.log(isOTPVerified)

    if (isOTPVerified) {
      
      res.json({ success: true,message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'token has expired' });
    }
  } catch (error) {
    next(error); 
  }
};

export const resendOTPController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { requestId } = req.body;
    const otpResponse = await resendOTP(requestId);

    res.json(otpResponse);
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred while processing your request.' });
    next(error);
  }
};

