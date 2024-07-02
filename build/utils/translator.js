"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateLiteral = void 0;
const types_1 = require("../types");
const common_1 = require("./common");
function translateLiteral(type, val) {
    if (type === types_1.TokenType.STR) {
        return (0, common_1.escapeStr)(String(val));
    }
    return String(val);
}
exports.translateLiteral = translateLiteral;
