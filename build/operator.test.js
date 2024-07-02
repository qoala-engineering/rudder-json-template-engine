"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("./operators");
describe('Operators tests', () => {
    describe('isStandardFunction', () => {
        it('should return true for standard functions', () => {
            expect(Object.keys(operators_1.standardFunctions).every(operators_1.isStandardFunction)).toBeTruthy();
        });
        it('should return false for non standard function', () => {
            const nonStandardFunctions = [
                'toString',
                'valueOf',
                'toLocaleString',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor',
            ];
            expect(Object.keys(nonStandardFunctions).every(operators_1.isStandardFunction)).toBeFalsy();
        });
    });
});
