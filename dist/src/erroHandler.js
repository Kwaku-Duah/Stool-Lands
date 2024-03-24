"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const rootException_1 = require("./exceptions/rootException");
const internalException_1 = require("./exceptions/internalException");
const errorHandler = (method) => {
    return async (req, res, next) => {
        try {
            method(req, res, next);
        }
        catch (error) {
            let exception;
            if (error instanceof rootException_1.HttpException) {
                exception = error;
            }
            else {
                exception = new internalException_1.InternalException('Something went wrong', error, rootException_1.ErrorCode.INTERNAL_EXCEPTION);
            }
            next(exception);
        }
    };
};
exports.errorHandler = errorHandler;
