"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTemporaryPassword = void 0;
const generateTemporaryPassword = () => {
    const length = 10;
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numericChars = "0123456789";
    const symbolChars = "!@#$%^&*()_-+=<>?/[]{}|";
    const allChars = uppercaseChars + lowercaseChars + numericChars + symbolChars;
    let temporaryPassword = "";
    temporaryPassword += getRandomChar(uppercaseChars);
    temporaryPassword += getRandomChar(lowercaseChars);
    temporaryPassword += getRandomChar(numericChars);
    temporaryPassword += getRandomChar(symbolChars);
    for (let i = 0; i < length - 4; i++) {
        temporaryPassword += getRandomChar(allChars);
    }
    temporaryPassword = temporaryPassword
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");
    return temporaryPassword;
};
exports.generateTemporaryPassword = generateTemporaryPassword;
const getRandomChar = (charSet) => {
    const randomIndex = Math.floor(Math.random() * charSet.length);
    return charSet[randomIndex];
};
