import { Router } from "express";
import { allevents, userCount, countApprovedForms, countDeniedForms, deleteAppointment} from "../controllers/chiefController";
import { authMiddleware,adminMiddleware, roleMiddleware } from "../middleWares/authMiddleware";


const chiefRouter: Router = Router();
chiefRouter.get('/events',[authMiddleware,roleMiddleware],allevents);
chiefRouter.get('/user-count',[authMiddleware,roleMiddleware],userCount)
chiefRouter.get('/total-approved',[authMiddleware,roleMiddleware],countApprovedForms)
chiefRouter.get('/total-denied',[authMiddleware,roleMiddleware],countDeniedForms);
chiefRouter.delete('/delete',deleteAppointment);
export default chiefRouter;