import { NextFunction, Request, Response } from 'express';
import db from '../dbConfig/db';
import { compare, hashSync } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET,expiration } from '../secrets';
import { ROLE } from '@prisma/client';
import { applicantNotice } from '../services/applicantMail';



export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, phoneNumber, occupation, newPassword, confirmPassword } = req.body;

    if (email && email.trim() !== '') {
      const existingUserByEmail = await db.user.findFirst({
        where: {
          email: email
        }
      });

      if (existingUserByEmail) {
        throw new Error('Email is already registered');
      }
    }

    const existingUserByPhoneNumber = await db.user.findFirst({
      where: {
        phoneNumber: phoneNumber
      }
    });

    if (existingUserByPhoneNumber) {
      throw new Error('Phone number is already registered');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('New password and confirm password do not match');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new Error('Password must contain at least 8 characters including letters, numbers, and special symbols');
    }

    const hashedPassword = hashSync(newPassword, 10);

    const newUser = await db.user.create({
      data: {
        name: name,
        email: email ? email : null,
        phoneNumber: phoneNumber,
        occupation: occupation,
        password: hashedPassword,
        changePassword: false,
        role: ROLE.APPLICANT
      }
    });

    await applicantNotice(name, email, phoneNumber);
    res.status(200).json({ message: `Signup successful, welcome ${newUser.name}`});

  } catch (error) {
    let statusCode = 400;
    if (error instanceof Error) {
      if (error.message === 'Email is already registered' || error.message === 'Phone number is already registered') {
        statusCode = 409; 
      } else if (error.message === 'New password and confirm password do not match' || error.message === 'Password must be at least 8 characters long' || error.message === 'Password must contain at least 8 characters including letters, numbers, and special symbols') {
        statusCode = 422;
      }
    }

    res.status(statusCode).json({ error: error instanceof Error ? error.message : 'An error occurred' });
  }
};


export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const { emailOrPhone, password } = req.body;
      const user = await db.user.findFirst({
          where: {
              OR: [{ phoneNumber: emailOrPhone }, { email: emailOrPhone }]
          }
      });

      if (!user) {
          throw new Error('Invalid email or password');
      }

      const isPasswordValid: boolean = await compare(password, user.password);

      if (!isPasswordValid) {
          throw new Error('Invalid email or password');
      }

      const token: string = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET!, {
          expiresIn: expiration
      });
      res.json({ user: { ...user, password: undefined }, token, expiration });
  } catch (error) {
      let statusCode = 401;
      let errorMessage = 'Invalid email or password';

      res.status(statusCode).json({ error: errorMessage });
  }
};


export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      res.status(200).json({ message: 'Logged out successfully' });
    } else {
      res.status(400).json({ error: 'Local storage is not available in this environment' });
    }
  } catch (error) {
    next(error);
  }
};