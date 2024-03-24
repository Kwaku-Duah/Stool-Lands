"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedScript = void 0;
const bcrypt_1 = require("bcrypt");
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../src/dbConfig/db"));
const logMessage = (message) => {
    process.stdout.write(`${message}\n`);
};
const email = 'adminEmail.org';
function seedScript() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if the user with the given email already exists
        const existingUser = yield db_1.default.user.findFirst({
            where: {
                email: email
            }
        });
        if (existingUser) {
            // If the user exists, delete it
            yield db_1.default.user.delete({
                where: {
                    email: email
                }
            });
            logMessage('Existing user deleted.');
        }
        // Create the user with the specified details
        const hashedPassword = (0, bcrypt_1.hashSync)('$nanaKwakuDollars', 10);
        const phoneNumber = '233-542370701';
        yield db_1.default.user.create({
            data: {
                username: "Nana Kwaku Duah",
                email: email,
                phoneNumber: phoneNumber,
                password: hashedPassword,
                role: client_1.ROLE.ADMIN
            }
        });
        logMessage('User created successfully.');
    });
}
exports.seedScript = seedScript;
seedScript();
