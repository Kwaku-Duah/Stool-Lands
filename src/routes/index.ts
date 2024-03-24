import { Router } from 'express';
import authRoutes from './authRouter';
const rootRouter: Router = Router();
rootRouter.use('/auth', authRoutes);

export default rootRouter;