import { Router } from 'express';
import authRoutes from './authRouter';
import forgotRoute from './forgotRoutes';
import formRouter from './formRouter'
import transactionRoute from './transactionRouter';
import callbackRoute from './callbackRouter';
import backRoute from './backOfficeRoute';


const rootRouter: Router = Router();
rootRouter.use('/auth', authRoutes);
rootRouter.use('/password',forgotRoute)
rootRouter.use('/pay', transactionRoute)
rootRouter.use('/transaction', callbackRoute)
rootRouter.use('/new',formRouter)
rootRouter.use('/add',backRoute)
export default rootRouter;