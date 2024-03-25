import { NextFunction, Request, Response } from 'express';
import db from '../dbConfig/db';
import { compare, hashSync } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET,expiration } from '../secrets';
import { ROLE } from '@prisma/client';
import ms from 'ms';
import { applicantNotice } from '../services/applicantMail';
import { generateApplicantID } from '../utils/genApplicantId';




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
      const token: string = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, {
          expiresIn: expiration
      });

      res.json({ user: { ...newUser, password: undefined }, token });
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

    const changePassword = user.role === 'ADMIN' ? false: user.changePassword;
    const token: string = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: expiration
    });

    const expirationMilliseconds = ms(expiration);
    const expirationTime = Date.now() + expirationMilliseconds / (1000 * 60 * 60)


    // Send the token and expiration time in the response
    res.json({ user: { ...user, password: undefined, changePassword }, token, expirationTime });
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
