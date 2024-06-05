"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignInspector = void 0;
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
        let assigned = await db_1.default.application.findUnique({
            where: { uniqueFormID },
        }) || await db_1.default.organizationForm.findUnique({
            where: { uniqueFormID },
        });
        if (!assigned) {
            return res.status(404).json({ success: false, message: 'Form not found' });
        }
        const createdAssignment = await db_1.default.assignment.create({
            data: {
                uniqueFormID,
                secretaryId: secretaryId,
                isAssigned: true,
            },
        });
        const invitation = await db_1.default.invitation.create({
            data: {
                assignmentId: createdAssignment.id,
                inspectors: {
                    connect: { inspectorId: inspector.inspectorId },
                },
            },
        });
        return res.status(200).json({ success: true, message: 'Form assigned successfully', invitation });
    }
    catch (error) {
        console.error('Error occurred while assigning form:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
};
exports.assignInspector = assignInspector;
