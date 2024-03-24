import { Router } from 'express';
import authRoutes from './authRouter';
import forgotRoute from './forgotRoutes';
const rootRouter: Router = Router();


rootRouter.use('/auth', authRoutes);
rootRouter.use('/password',forgotRoute)
export default rootRouter;