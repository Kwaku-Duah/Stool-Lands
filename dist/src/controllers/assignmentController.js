"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectorAssign = exports.assignInspector = void 0;
const db_1 = __importDefault(require("../dbConfig/db"));
const assignInspector = async (req, res) => {
    const { uniqueFormID, email } = req.body;
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userEmail = user.email;
        const secretary = await db_1.default.secretary.findUnique({
            where: { email: userEmail },
        });
        if (!secretary) {
            return res.status(404).json({ success: false, message: 'Secretary not found for the user' });
        }
        const secretaryId = secretary.secretaryId;
        const inspector = await db_1.default.inspector.findUnique({
            where: { email },
        });
        if (!inspector) {
            return res.status(403).json({ success: false, message: 'User is not an inspector' });
        }
        // Check if the uniqueFormID exists in either Application or OrganizationForm
        const assignedApplication = await db_1.default.application.findUnique({
            where: { uniqueFormID },
        });
        const assignedOrganizationForm = await db_1.default.organizationForm.findUnique({
            where: { uniqueFormID },
        });
        if (!assignedApplication && !assignedOrganizationForm) {
            return res.status(404).json({ success: false, message: 'Form not found' });
        }
        const createdAssignment = await db_1.default.assignment.create({
            data: {
                uniqueFormID,
                secretaryId,
                isAssigned: true,
            },
        });
        const invitation = await db_1.default.invitation.create({
            data: {
                assignmentId: createdAssignment.uniqueFormID,
                inspectors: {
                    connect: { inspectorId: inspector.inspectorId },
                },
            },
        });
        const assignedForm = assignedApplication || assignedOrganizationForm;
        return res.status(200).json({ success: true, message: 'Form assigned successfully', invitation, assignedForm });
    }
    catch (error) {
        console.error('Error occurred while assigning form:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
};
exports.assignInspector = assignInspector;
const inspectorAssign = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.email) {
            return res.status(404).json({ success: false, message: 'User not found or email is missing' });
        }
        const inspector = await db_1.default.inspector.findUnique({
            where: { email: user.email },
        });
        if (!inspector) {
            return res.status(404).json({ success: false, message: 'Inspector not found' });
        }
        const invitations = await db_1.default.invitation.findMany({
            where: {
                inspectors: {
                    some: {
                        inspectorId: inspector.inspectorId,
                    },
                },
            },
            include: {
                Assignment: true,
            },
        });
        const forms = [];
        for (const invitation of invitations) {
            const assignmentId = invitation.Assignment?.uniqueFormID;
            if (assignmentId) {
                const applicationForm = await db_1.default.application.findUnique({
                    where: { uniqueFormID: assignmentId },
                    include: { documents: true }
                });
                const organizationForm = await db_1.default.organizationForm.findUnique({
                    where: { uniqueFormID: assignmentId },
                    include: { documents: true }
                });
                if (applicationForm) {
                    forms.push(applicationForm);
                }
                if (organizationForm) {
                    forms.push(organizationForm);
                }
            }
        }
        return res.status(200).json({ success: true, forms });
    }
    catch (error) {
        console.error('Error occurred while fetching inspector assignments:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
};
exports.inspectorAssign = inspectorAssign;
