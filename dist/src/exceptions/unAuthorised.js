"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedException = void 0;
const rootException_1 = require("./rootException");
class UnauthorizedException extends rootException_1.HttpException {
    constructor(message, errorCode, errors) {
        super(message, errorCode, 401, errors);
    }
}
exports.UnauthorizedException = UnauthorizedException;
