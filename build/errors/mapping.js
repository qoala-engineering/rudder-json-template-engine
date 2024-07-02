"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonTemplateMappingError = void 0;
class JsonTemplateMappingError extends Error {
    constructor(message, inputMapping, outputMapping) {
        super(`${message}. Input: ${inputMapping}, Output: ${outputMapping}`);
        this.inputMapping = inputMapping;
        this.outputMapping = outputMapping;
    }
}
exports.JsonTemplateMappingError = JsonTemplateMappingError;
