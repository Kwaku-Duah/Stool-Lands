"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnprocessableEntity = void 0;
const rootException_1 = require("./rootException");
class UnprocessableEntity extends rootException_1.HttpException {
    constructor(error, message, errorCode) {
        super(message, errorCode, 422, error);
    }
}
exports.UnprocessableEntity = UnprocessableEntity;
