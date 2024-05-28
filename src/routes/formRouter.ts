import express from 'express';
import { fillApplicationForm,getFormsCreatedByUser,getAllForms,createTicket,createReport } from '../controllers/applicantFormController';
import { createOrganizationForm } from '../controllers/orgApplication';
import { jointApplicationForm } from '../controllers/jointForm';
import { authMiddleware,applicantMiddleware, roleMiddleware} from '../middleWares/authMiddleware';
import upload from '../middleWares/uploadMulter'


const router = express.Router();

// Route to handle filling the application form with multer middleware
router.post('/apply', [authMiddleware,applicantMiddleware],upload.any(),fillApplicationForm);
router.get('/applications',[authMiddleware,applicantMiddleware],getFormsCreatedByUser)


// route for admin/secretary
router.get('/all-forms',[authMiddleware,roleMiddleware],getAllForms)


// organization
router.post('/org-apply',[authMiddleware,applicantMiddleware],upload.any(),createOrganizationForm)

// JOINT appliaction form
router.post('/joint-apply',[authMiddleware,applicantMiddleware],upload.any(),jointApplicationForm)

// make an enquiry
router.post('/report',createReport)

// raise an issue
router.post('/issue',createTicket)

export default router;
