"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("./engine");
describe('engine', () => {
    describe('isValidJSONPath', () => {
        it('should return true for valid JSON root path', () => {
            expect(engine_1.JsonTemplateEngine.isValidJSONPath('$.user.name')).toBeTruthy();
        });
        it('should return true for valid JSON relative path', () => {
            expect(engine_1.JsonTemplateEngine.isValidJSONPath('.user.name')).toBeTruthy();
            expect(engine_1.JsonTemplateEngine.isValidJSONPath('@.user.name')).toBeTruthy();
        });
        it('should return false for invalid JSON path', () => {
            expect(engine_1.JsonTemplateEngine.isValidJSONPath('userId')).toBeFalsy();
        });
        it('should return false for invalid template', () => {
            expect(engine_1.JsonTemplateEngine.isValidJSONPath('a=')).toBeFalsy();
        });
        it('should return false for empty path', () => {
            expect(engine_1.JsonTemplateEngine.isValidJSONPath('')).toBeFalsy();
        });
    });
    describe('validateMappings', () => {
        it('should validate mappings', () => {
            expect(() => engine_1.JsonTemplateEngine.validateMappings([
                {
                    input: '$.userId',
                    output: '$.user.id',
                },
                {
                    input: '$.discount',
                    output: '$.events[0].items[*].discount',
                },
            ])).not.toThrow();
        });
        it('should throw error for mappings which are not compatible with each other', () => {
            expect(() => engine_1.JsonTemplateEngine.validateMappings([
                {
                    input: '$.events[0]',
                    output: '$.events[0].name',
                },
                {
                    input: '$.discount',
                    output: '$.events[0].name[*].discount',
                },
            ])).toThrowError('Invalid mapping');
        });
        it('should throw error for mappings with invalid json paths', () => {
            expect(() => engine_1.JsonTemplateEngine.validateMappings([
                {
                    input: 'events[0]',
                    output: 'events[0].name',
                },
            ])).toThrowError('Invalid mapping');
        });
    });
});
