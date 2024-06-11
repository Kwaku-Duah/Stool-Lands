"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const applicantFormController_1 = require("../controllers/applicantFormController");
const orgApplication_1 = require("../controllers/orgApplication");
const jointForm_1 = require("../controllers/jointForm");
const authMiddleware_1 = require("../middleWares/authMiddleware");
const uploadMulter_1 = __importDefault(require("../middleWares/uploadMulter"));
const formRouter = (0, express_1.Router)();
// Route to handle filling the application form with multer middleware
formRouter.post('/apply', [authMiddleware_1.authMiddleware, authMiddleware_1.applicantMiddleware], uploadMulter_1.default.any(), applicantFormController_1.fillApplicationForm);
formRouter.get('/applications', [authMiddleware_1.authMiddleware, authMiddleware_1.applicantMiddleware], applicantFormController_1.getFormsCreatedByUser);
// approve or deny a form
formRouter.post('/status', [authMiddleware_1.authMiddleware, authMiddleware_1.inspectorMiddleware], applicantFormController_1.statusForm);
// organization
formRouter.post('/org-apply', [authMiddleware_1.authMiddleware, authMiddleware_1.applicantMiddleware], uploadMulter_1.default.any(), orgApplication_1.createOrganizationForm);
// JOINT appliaction form
formRouter.post('/joint-apply', [authMiddleware_1.authMiddleware, authMiddleware_1.applicantMiddleware], uploadMulter_1.default.any(), jointForm_1.jointApplicationForm);
// make an enquiry
formRouter.post('/report', applicantFormController_1.createReport);
// raise an issue
formRouter.post('/issue', applicantFormController_1.createTicket);
exports.default = formRouter;
