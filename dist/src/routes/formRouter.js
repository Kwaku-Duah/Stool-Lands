"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const applicantFormController_1 = require("../controllers/applicantFormController");
const orgApplication_1 = require("../controllers/orgApplication");
const jointForm_1 = require("../controllers/jointForm");
const authMiddleware_1 = require("../middleWares/authMiddleware");
const uploadMulter_1 = __importDefault(require("../middleWares/uploadMulter"));
const router = express_1.default.Router();
// Route to handle filling the application form with multer middleware
router.post('/apply', [authMiddleware_1.authMiddleware, authMiddleware_1.applicantMiddleware], uploadMulter_1.default.any(), applicantFormController_1.fillApplicationForm);
router.get('/applications', [authMiddleware_1.authMiddleware, authMiddleware_1.applicantMiddleware], applicantFormController_1.getFormsCreatedByUser);
// organization
router.post('/org-apply', [authMiddleware_1.authMiddleware, authMiddleware_1.applicantMiddleware], uploadMulter_1.default.any(), orgApplication_1.createOrganizationForm);
// JOINT appliaction form
router.post('/joint-apply', [authMiddleware_1.authMiddleware, authMiddleware_1.applicantMiddleware], uploadMulter_1.default.any(), jointForm_1.jointApplicationForm);
router.post('/report', applicantFormController_1.createReport);
exports.default = router;
