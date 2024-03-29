"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundException = void 0;
const rootException_1 = require("./rootException");
class NotFoundException extends rootException_1.HttpException {
    constructor(message, errorCode) {
        super(message, errorCode, 404, null);
    }
}
exports.NotFoundException = NotFoundException;
