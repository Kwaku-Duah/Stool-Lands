"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalException = void 0;
const rootException_1 = require("./rootException");
class InternalException extends rootException_1.HttpException {
    constructor(message, errors, errorCode) {
        super(message, errorCode, 500, errors);
    }
}
exports.InternalException = InternalException;
