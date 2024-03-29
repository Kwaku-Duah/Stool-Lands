import dotenv from 'dotenv';
dotenv.config();
export const JWT_SECRET = process.env.JWT_SECRET
export const expiration="1h";
export const PORT = "5000";

export const ADMIN_MAIL=process.env.ADMIN_MAIL
export const ADMIN_PASS=process.env.ADMIN_PASS
export const FRONTEND_ORIGIN="http:localhost:5000/";
export const username=process.env.username
export const password=process.env.password
export const senderId=process.env.senderId