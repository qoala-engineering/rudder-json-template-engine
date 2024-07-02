"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeStr = exports.isExpression = exports.CreateAsyncFunction = exports.convertToStatementsExpr = exports.createBlockExpression = exports.getLastElement = exports.toArray = void 0;
const types_1 = require("../types");
function toArray(val) {
    if (val === undefined || val === null) {
        return undefined;
    }
    return Array.isArray(val) ? val : [val];
}
exports.toArray = toArray;
function getLastElement(arr) {
    if (!arr.length) {
        return undefined;
    }
    return arr[arr.length - 1];
}
exports.getLastElement = getLastElement;
function createBlockExpression(expr) {
    return {
        type: types_1.SyntaxType.BLOCK_EXPR,
        statements: [expr],
    };
}
exports.createBlockExpression = createBlockExpression;
function convertToStatementsExpr(...expressions) {
    return {
        type: types_1.SyntaxType.STATEMENTS_EXPR,
        statements: expressions,
    };
}
exports.convertToStatementsExpr = convertToStatementsExpr;
function CreateAsyncFunction(...args) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function, func-names
    return async function () { }.constructor(...args);
}
exports.CreateAsyncFunction = CreateAsyncFunction;
function isExpression(val) {
    return (typeof val === 'object' && !Array.isArray(val) && Object.values(types_1.SyntaxType).includes(val.type));
}
exports.isExpression = isExpression;
function escapeStr(s) {
    if (typeof s !== 'string') {
        return '';
    }
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}
exports.escapeStr = escapeStr;
