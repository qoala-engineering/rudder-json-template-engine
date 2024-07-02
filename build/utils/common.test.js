"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const types_1 = require("../types");
const CommonUtils = __importStar(require("./common"));
describe('Common Utils tests', () => {
    describe('toArray', () => {
        it('should return array for non array', () => {
            expect(CommonUtils.toArray(1)).toEqual([1]);
        });
        it('should return array for array', () => {
            expect(CommonUtils.toArray([1])).toEqual([1]);
        });
        it('should return array for undefined', () => {
            expect(CommonUtils.toArray(undefined)).toBeUndefined();
        });
    });
    describe('getLastElement', () => {
        it('should return last element of non empty array', () => {
            expect(CommonUtils.getLastElement([1, 2])).toEqual(2);
        });
        it('should return undefined for empty array', () => {
            expect(CommonUtils.getLastElement([])).toBeUndefined();
        });
    });
    describe('convertToStatementsExpr', () => {
        it('should return statement expression for no expressions', () => {
            expect(CommonUtils.convertToStatementsExpr()).toEqual({
                type: types_1.SyntaxType.STATEMENTS_EXPR,
                statements: [],
            });
        });
        it('should return statement expression for single expression', () => {
            expect(CommonUtils.convertToStatementsExpr(constants_1.EMPTY_EXPR)).toEqual({
                type: types_1.SyntaxType.STATEMENTS_EXPR,
                statements: [constants_1.EMPTY_EXPR],
            });
        });
        it('should return statement expression for multiple expression', () => {
            expect(CommonUtils.convertToStatementsExpr(constants_1.EMPTY_EXPR, constants_1.EMPTY_EXPR)).toEqual({
                type: types_1.SyntaxType.STATEMENTS_EXPR,
                statements: [constants_1.EMPTY_EXPR, constants_1.EMPTY_EXPR],
            });
        });
    });
    describe('escapeStr', () => {
        it('should return emtpy string for non string input', () => {
            expect(CommonUtils.escapeStr(undefined)).toEqual('');
        });
        it('should return escaped string for simple string input', () => {
            expect(CommonUtils.escapeStr('aabc')).toEqual(`"aabc"`);
        });
        it('should return escaped string for string with escape characters', () => {
            expect(CommonUtils.escapeStr(`a\nb'"c`)).toEqual(`"a\nb'\\"c"`);
        });
    });
    describe('CreateAsyncFunction', () => {
        it('should return async function from code without args', async () => {
            expect(await CommonUtils.CreateAsyncFunction('return 1')()).toEqual(1);
        });
        it('should return async function from code with args', async () => {
            expect(await CommonUtils.CreateAsyncFunction('input', 'return input')(1)).toEqual(1);
        });
    });
});
