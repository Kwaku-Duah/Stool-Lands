"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueFormID = void 0;
const generateUniqueFormID = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uniqueFormID = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        uniqueFormID += characters.charAt(randomIndex);
    }
    return uniqueFormID;
};
exports.generateUniqueFormID = generateUniqueFormID;
