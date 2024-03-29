import dotenv from 'dotenv';
dotenv.config();
export const JWT_SECRET = process.env.JWT_SECRET
export const expiration="1h";
export const PORT = "5000";

export const ADMIN_MAIL=process.env.ADMIN_MAIL
export const ADMIN_PASS=process.env.ADMIN_PASS
export const FRONTEND_ORIGIN=process.env.FRONTEND_ORIGIN
export const username=process.env.USERNAME
export const password=process.env.PASSWORD
export const senderId=process.env.SENDERID