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

    // Check if the email is provided and is not empty
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
        role: ROLE.APPLICANT
      }
    });

 
      await applicantNotice(name, email, phoneNumber);
    res.status(200).json({ message: 'Signup successful'});

  } catch (error) {
    next(error);
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
      res.json({ user: { ...user, password: undefined }, token,expiration});
    } catch (error) {
      next(error);
    }
};


export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
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