import { Router } from 'express';
import { login,signup,logout } from '../controllers/authController';
import { errorHandler } from '../erroHandler';


const authRoutes: Router = Router();
authRoutes.post('/signup',errorHandler(signup))
authRoutes.post('/login', errorHandler(login));
authRoutes.post('/logout',errorHandler(logout))
export default authRoutes;