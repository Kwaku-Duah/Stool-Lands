import { NextFunction, Request, Response } from 'express';
import db from '../dbConfig/db';
import bcrypt from 'bcrypt';
import { compare, hashSync } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET,expiration } from '../secrets';
import { ROLE } from '@prisma/client';
import ms from 'ms';
import { applicantNotice } from '../services/applicantMail';
import { generateApplicantID } from '../utils/genApplicantId';
import { sendOTP,verifyOTP } from '../services/sendOTP';
import { resendOTP } from '../services/resendOTP';



export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

      const { username, email, password, phoneNumber } = req.body;
      const newApplicantId = await generateApplicantID()
      const existingUserByEmail = await db.user.findFirst({
          where: {
              email: email
          }
      });

      if (existingUserByEmail) {
          throw new Error('Email is already registered');
      }

      // Check if the phone number is already registered
      const existingUserByPhoneNumber = await db.user.findFirst({
          where: {
              phoneNumber: phoneNumber
          }
      });

      if (existingUserByPhoneNumber) {
          throw new Error('Phone number is already registered');
      }

      // Hash the password
      const hashedPassword = hashSync(password, 10);

      // Create the user
      const newUser = await db.user.create({
          data: {
              username: username,
              email: email,
              staffId:newApplicantId,
              phoneNumber: phoneNumber,
              password: hashedPassword,
              role: ROLE.APPLICANT
          }
      });
      await db.applicant.create({
        data: {
          id: newUser.id,
          email: newUser.email,
          applicantId: newApplicantId
        }
      });
      await applicantNotice(username,newUser.email,phoneNumber,newUser.staffId);

      // Create JWT token
      const token: string = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET!, {
          expiresIn: expiration
      });

      res.json({ user: { ...newUser, password: undefined }, token });
  } catch (error) {
      next(error);
  }
};


export const loginWithEmail = async (email: string, password: string, res: Response) => {
  try {
    const user = await db.user.findFirst({
      where: {
        email
      }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const changePassword = user.role === 'ADMIN' ? false : user.changePassword;
    const token: string = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET!, {
      expiresIn: expiration
    });

    const expirationMilliseconds = ms(expiration);
    const expirationTime = Date.now() + expirationMilliseconds / (1000 * 60 * 60)

    // Send the token, expiration time, and user details in the response
    res.json({ user: { ...user, password: undefined, changePassword }, token, expirationTime });
  } catch (error:unknown) {
    throw new Error("Error"); // Rethrow error to be caught by the error handler
  }
};

export const loginWithPhoneNumber = async (phoneNumber: string, res: Response) => {
  try {
    // Send OTP
    const otpResponse = await sendOTP(phoneNumber);
    if (!otpResponse) {
      throw new Error('Error sending OTP');
    }
    console.log('OTP sent successfully');

    // Extract requestId and prefix from otpResponse
    const { requestId, prefix } = otpResponse;

    // Find user by phone number
    const user = await db.user.findFirst({
      where: {
        phoneNumber
      }
    });

    if (!user) {
      throw new Error('Invalid phone number');
    }
    const changePassword = user.role === 'ADMIN' ? false : user.changePassword;
    const token: string = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET!, {
      expiresIn: expiration
    });

    const expirationMilliseconds = ms(expiration);
    const expirationTime = Date.now() + expirationMilliseconds / (1000 * 60 * 60)

    // Send the token, expiration time, and user details in the response
    res.json({ user: { ...user, password: undefined, changePassword }, token, expirationTime,requestId,prefix});
  

  } catch (error:unknown) {
    throw new Error("Error");
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { emailOrPhone, password } = req.body;

    if (emailOrPhone.includes('@')) {
      await loginWithEmail(emailOrPhone, password, res);
    } else {
      await loginWithPhoneNumber(emailOrPhone, res);
    }
  } catch (error) {
    next(error);
  }
};

export const resendOTPController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const { requestId } = req.body;
      const otpResponse = await resendOTP(requestId);

      // Handle the response as needed
      res.json(otpResponse);
  } catch (error) {
      next(error);
  }
};

export const verifyOTPController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract required parameters from the request body
    const { requestId, prefix, code } = req.body;

    // Call the OTP verification service with expirationTime parameter
    const isOTPVerified = await verifyOTP(requestId, prefix, code);
    console.log(isOTPVerified)

    // Send response based on OTP verification result
    if (isOTPVerified) {
      
      res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'token has expired' });
    }
  } catch (error) {
    next(error); 
  }
};



export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Clear authentication token (JWT) from local storage
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      res.status(200).json({ message: 'Logged out successfully' });
    } else {
      throw new Error('Local storage is not available in this environment');
    }
  } catch (error) {
    next(error);
  }
};
