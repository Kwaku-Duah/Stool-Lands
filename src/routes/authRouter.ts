import { Router } from 'express';
import { login,signup } from '../controllers/authController';
import { errorHandler } from '../erroHandler';


const authRoutes: Router = Router();
authRoutes.post('/signup',errorHandler(signup))
authRoutes.post('/login', errorHandler(login));
export default authRoutes;