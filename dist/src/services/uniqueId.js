"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueFormID = void 0;
const generateUniqueFormID = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uniqueID = '';
    for (let i = 0; i < 2; i++) {
        uniqueID += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    for (let i = 0; i < 3; i++) {
        uniqueID += Math.floor(Math.random() * 10);
    }
    return uniqueID;
};
exports.generateUniqueFormID = generateUniqueFormID;
