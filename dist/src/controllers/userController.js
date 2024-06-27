"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allInspectors = exports.deleteUser = exports.userDeactivate = exports.userActivate = exports.allTickets = exports.specificForms = exports.getAllForms = exports.allUsers = void 0;
const db_1 = __importDefault(require("../dbConfig/db"));
const allUsers = async (req, res) => {
    try {
        const users = await db_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                activeStatus: true
            }
        });
        res.status(200).json({ users });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'An error occurred while fetching users' });
    }
};
exports.allUsers = allUsers;
const getAllForms = async (req, res) => {
    try {
        const applicationForms = await db_1.default.application.findMany({
            include: {
                documents: true,
            },
        });
        const organizationForms = await db_1.default.organizationForm.findMany({
            include: {
                documents: true,
            },
        });
        const forms = [...applicationForms, ...organizationForms];
        const formsWithInspectors = await Promise.all(forms.map(async (form) => {
            const assignment = await db_1.default.assignment.findFirst({
                where: {
                    uniqueFormID: form.uniqueFormID,
                },
                include: {
                    invitations: {
                        include: {
                            inspectors: {
                                include: {
                                    user: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            const inspectorName = assignment?.invitations[0]?.inspectors[0]?.user?.name || null;
            return {
                ...form,
                inspectorName,
            };
        }));
        res.status(200).json({ success: true, forms: formsWithInspectors });
    }
    catch (error) {
        console.error('Error occurred while fetching forms:', error);
        res.status(500).json({ success: false, error: 'An error occurred while processing your request' });
    }
};
exports.getAllForms = getAllForms;
const specificForms = async (req, res) => {
    try {
        const userId = parseInt(req.params.userid, 10);
        console.log(userId);
        const applicationForms = await db_1.default.application.findMany({
            where: { userId },
            include: { documents: true }
        });
        const organizationForms = await db_1.default.organizationForm.findMany({
            where: { userId },
            include: { documents: true }
        });
        const forms = [...applicationForms, ...organizationForms];
        res.status(200).json({ success: true, forms });
    }
    catch (error) {
        console.error('Error occurred while fetching forms:', error);
        res.status(500).json({ success: false, error: 'An error occurred while processing your request' });
    }
};
exports.specificForms = specificForms;
const allTickets = async (req, res) => {
    try {
        const tickets = await db_1.default.ticket.findMany();
        if (tickets.length === 0) {
            return res.status(200).json({ message: 'No tickets yet' });
        }
        res.status(200).json({ tickets });
    }
    catch (error) {
        console.error('Error occurred while fetching tickets:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
exports.allTickets = allTickets;
const userActivate = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Authenticated user required' });
        }
        const user = await db_1.default.user.update({
            where: { id: userId },
            data: { activeStatus: true },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role === 'ADMIN' || user.role === 'SECRETARY') {
            return res.status(403).json({ success: false, message: 'Cannot delete an admin or secretary user' });
        }
        return res.status(200).json({ success: true, message: 'User activated successfully', user });
    }
    catch (error) {
        console.error('Error occurred while deactivating user:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
};
exports.userActivate = userActivate;
const userDeactivate = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Authenticated user required' });
        }
        const user = await db_1.default.user.update({
            where: { id: userId },
            data: { activeStatus: false },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role === 'ADMIN' || user.role === 'SECRETARY') {
            return res.status(403).json({ success: false, message: 'Cannot delete an admin or secretary user' });
        }
        return res.status(200).json({ success: true, message: 'User deactivated successfully', user });
    }
    catch (error) {
        console.error('Error occurred while deactivating user:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
};
exports.userDeactivate = userDeactivate;
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role === 'ADMIN' || user.role === 'SECRETARY') {
            return res.status(403).json({ success: false, message: 'Cannot delete an admin or secretary user' });
        }
        const nullifiedUser = await db_1.default.user.update({
            where: { id: userId },
            data: {
                name: null,
                email: null,
                phoneNumber: null,
                occupation: null,
                password: null,
                changePassword: false,
                role: null,
                activeStatus: false,
            },
        });
        return res.status(200).json({ success: true, message: 'User nullified successfully', nullifiedUser });
    }
    catch (error) {
        console.error('Error occurred while nullifying user:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
};
exports.deleteUser = deleteUser;
const allInspectors = async (req, res) => {
    try {
        const inspectors = await db_1.default.user.findMany({
            where: {
                role: 'INSPECTOR'
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });
        res.status(200).json(inspectors);
    }
    catch (error) {
        console.error('Error fetching inspectors:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.allInspectors = allInspectors;
