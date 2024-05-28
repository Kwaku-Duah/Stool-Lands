import {Router} from 'express';
import { fillApplicationForm,getFormsCreatedByUser,createTicket,createReport } from '../controllers/applicantFormController';
import { createOrganizationForm } from '../controllers/orgApplication';
import { jointApplicationForm } from '../controllers/jointForm';
import { authMiddleware,applicantMiddleware, roleMiddleware} from '../middleWares/authMiddleware';
import upload from '../middleWares/uploadMulter'


const formRouter: Router = Router();

// Route to handle filling the application form with multer middleware
formRouter.post('/apply', [authMiddleware,applicantMiddleware],upload.any(),fillApplicationForm);
formRouter.get('/applications',[authMiddleware,applicantMiddleware],getFormsCreatedByUser)





// organization
formRouter.post('/org-apply',[authMiddleware,applicantMiddleware],upload.any(),createOrganizationForm)

// JOINT appliaction form
formRouter.post('/joint-apply',[authMiddleware,applicantMiddleware],upload.any(),jointApplicationForm)

// make an enquiry
formRouter.post('/report',createReport)

// raise an issue
formRouter.post('/issue',createTicket)

export default formRouter;
