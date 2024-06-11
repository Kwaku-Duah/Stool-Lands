import {Router} from 'express';
import { fillApplicationForm,getFormsCreatedByUser,createTicket,createReport,statusForm } from '../controllers/applicantFormController';
import { createOrganizationForm } from '../controllers/orgApplication';
import { jointApplicationForm } from '../controllers/jointForm';
import { authMiddleware,applicantMiddleware,inspectorMiddleware} from '../middleWares/authMiddleware';
import upload from '../middleWares/uploadMulter'


const formRouter: Router = Router();

// Route to handle filling the application form with multer middleware
formRouter.post('/apply', [authMiddleware,applicantMiddleware],upload.any(),fillApplicationForm);
formRouter.get('/applications',[authMiddleware,applicantMiddleware],getFormsCreatedByUser)

// approve or deny a form
formRouter.post('/status',[authMiddleware,inspectorMiddleware],statusForm)

formRouter.post('/org-apply',[authMiddleware,applicantMiddleware],upload.any(),createOrganizationForm)

formRouter.post('/joint-apply',[authMiddleware,applicantMiddleware],upload.any(),jointApplicationForm)


formRouter.post('/report',createReport)

formRouter.post('/issue',createTicket)

export default formRouter;
