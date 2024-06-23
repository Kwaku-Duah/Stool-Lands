import {Router} from 'express';
import { fillApplicationForm,getFormsCreatedByUser,createTicket,createReport,statusForm, handleTicketResponse } from '../controllers/applicantFormController';
import { createOrganizationForm } from '../controllers/orgApplication';
import { jointApplicationForm } from '../controllers/jointForm';
import { authMiddleware,applicantMiddleware,inspectorMiddleware, roleMiddleware} from '../middleWares/authMiddleware';
import upload from '../middleWares/uploadMulter'


const formRouter: Router = Router();

// Route to handle filling the application form with multer middleware
formRouter.post('/apply', [authMiddleware,applicantMiddleware],upload.any(),fillApplicationForm);
formRouter.get('/applications',[authMiddleware,applicantMiddleware],getFormsCreatedByUser)

// approve or deny a form
formRouter.post('/status',[authMiddleware,inspectorMiddleware],statusForm)

formRouter.post('/org-apply',[authMiddleware,applicantMiddleware],upload.any(),createOrganizationForm)

formRouter.post('/joint-apply',[authMiddleware,applicantMiddleware],upload.any(),jointApplicationForm)

formRouter.post('/ticket-reply',[authMiddleware,roleMiddleware],handleTicketResponse);


formRouter.post('/report',createReport)

// ticket endpoint can only be accessed by applicatants
formRouter.post('/issue',[authMiddleware,applicantMiddleware],createTicket)

export default formRouter;
