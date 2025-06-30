"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomResponse = exports.ResError = void 0;
class ResError {
    constructor(code, message, error) {
        (this.code = code), (this.message = message), (this.error = error);
    }
}
exports.ResError = ResError;
class CustomResponse {
    constructor(data, error) {
        (this.data = data), (this.error = error);
    }
}
exports.CustomResponse = CustomResponse;
