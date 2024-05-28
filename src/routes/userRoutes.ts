import {Router}from 'express';
import { allUsers, getAllForms } from '../controllers/userController';
import { authMiddleware,roleMiddleware } from '../middleWares/authMiddleware';

const userRoute: Router = Router()

userRoute.get('/users',[authMiddleware,roleMiddleware], allUsers)
// route for admin/secretary
userRoute.get('/forms',[authMiddleware,roleMiddleware],getAllForms)
export default userRoute;