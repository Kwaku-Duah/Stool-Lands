import { Router } from 'express';
import { errorHandler } from '../erroHandler';
import { changePassword, forgotReset } from '../controllers/passwordController';

const forgotRoute: Router = Router();
forgotRoute.post('/forgot', errorHandler(forgotReset));
forgotRoute.post('/reset', errorHandler(changePassword));
export default forgotRoute;