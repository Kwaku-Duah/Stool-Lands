import express from 'express';
import { fillApplicationForm,getFormsCreatedByUser,createReport } from '../controllers/applicantFormController';
import { createOrganizationForm } from '../controllers/orgApplication';
import { jointApplicationForm } from '../controllers/jointForm';
import { authMiddleware,applicantMiddleware } from '../middleWares/authMiddleware';

const router = express.Router();

// Route to handle filling the application form with multer middleware
router.post('/apply', [authMiddleware,applicantMiddleware],fillApplicationForm);
router.get('/applications',[authMiddleware,applicantMiddleware],getFormsCreatedByUser)
// organization

router.post('/org-apply',[authMiddleware,applicantMiddleware],createOrganizationForm)

// JOINT appliaction form
router.post('/joint-apply',[authMiddleware,applicantMiddleware],jointApplicationForm)
router.post('/report',createReport)

export default router;
