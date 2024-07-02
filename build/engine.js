"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonTemplateEngine = void 0;
/* eslint-disable import/no-cycle */
const constants_1 = require("./constants");
const mapping_1 = require("./errors/mapping");
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
const reverse_translator_1 = require("./reverse_translator");
const translator_1 = require("./translator");
const types_1 = require("./types");
const utils_1 = require("./utils");
class JsonTemplateEngine {
    constructor(fn) {
        this.fn = fn;
    }
    static compileAsSync(template, options) {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return Function(constants_1.DATA_PARAM_KEY, constants_1.BINDINGS_PARAM_KEY, JsonTemplateEngine.translate(template, options));
    }
    static compileAsAsync(templateOrExpr, options) {
        return (0, utils_1.CreateAsyncFunction)(constants_1.DATA_PARAM_KEY, constants_1.BINDINGS_PARAM_KEY, JsonTemplateEngine.translate(templateOrExpr, options));
    }
    static translateExpression(expr) {
        const translator = new translator_1.JsonTemplateTranslator(expr);
        return translator.translate();
    }
    static isValidJSONPath(path = '') {
        try {
            const expression = JsonTemplateEngine.parse(path, { defaultPathType: types_1.PathType.JSON });
            const statement = expression.statements?.[0];
            return (statement &&
                statement.type === types_1.SyntaxType.PATH &&
                (!statement.root || statement.root === constants_1.DATA_PARAM_KEY));
        }
        catch (e) {
            return false;
        }
    }
    static prepareMappings(mappings) {
        return mappings.map((mapping) => ({
            ...mapping,
            input: mapping.input ?? mapping.from,
            output: mapping.output ?? mapping.to,
        }));
    }
    static validateMappings(mappings, options) {
        JsonTemplateEngine.prepareMappings(mappings).forEach((mapping) => {
            if (!JsonTemplateEngine.isValidJSONPath(mapping.input) ||
                !JsonTemplateEngine.isValidJSONPath(mapping.output)) {
                throw new mapping_1.JsonTemplateMappingError('Invalid mapping: invalid JSON path', mapping.input, mapping.output);
            }
        });
        JsonTemplateEngine.parseMappingPaths(mappings, options);
    }
    static createFlatMappingsAST(mappings, options) {
        const newOptions = { ...options, mappings: true };
        return JsonTemplateEngine.prepareMappings(mappings)
            .filter((mapping) => mapping.input && mapping.output)
            .map((mapping) => ({
            ...mapping,
            inputExpr: JsonTemplateEngine.parse(mapping.input, newOptions).statements[0],
            outputExpr: JsonTemplateEngine.parse(mapping.output, newOptions).statements[0],
        }));
    }
    static parseMappingPaths(mappings, options) {
        return (0, utils_1.convertToObjectMapping)(JsonTemplateEngine.createFlatMappingsAST(mappings, options));
    }
    static create(templateOrExpr, options) {
        return new JsonTemplateEngine(JsonTemplateEngine.compileAsAsync(templateOrExpr, options));
    }
    static createAsSync(template, options) {
        return new JsonTemplateEngine(JsonTemplateEngine.compileAsSync(template, options));
    }
    static parse(template, options) {
        if (!template) {
            return constants_1.EMPTY_EXPR;
        }
        if ((0, utils_1.isExpression)(template)) {
            return template;
        }
        if (typeof template === 'string') {
            const lexer = new lexer_1.JsonTemplateLexer(template);
            const parser = new parser_1.JsonTemplateParser(lexer, options);
            return parser.parse();
        }
        return JsonTemplateEngine.parseMappingPaths(template, options);
    }
    static translate(template, options) {
        return JsonTemplateEngine.translateExpression(JsonTemplateEngine.parse(template, options));
    }
    static reverseTranslate(expr, options) {
        const translator = new reverse_translator_1.JsonTemplateReverseTranslator(options);
        let newExpr = expr;
        if (Array.isArray(expr)) {
            newExpr = JsonTemplateEngine.parseMappingPaths(expr, options);
        }
        return translator.translate(newExpr);
    }
    static convertMappingsToTemplate(mappings, options) {
        return JsonTemplateEngine.reverseTranslate(JsonTemplateEngine.parse(mappings, options), options);
    }
    static evaluateAsSync(template, options = {}, data = {}, bindings = {}) {
        return JsonTemplateEngine.createAsSync(template, options).evaluate(data, bindings);
    }
    static evaluate(template, options = {}, data = {}, bindings = {}) {
        return JsonTemplateEngine.create(template, options).evaluate(data, bindings);
    }
    evaluate(data = {}, bindings = {}) {
        return this.fn(data, bindings);
    }
}
exports.JsonTemplateEngine = JsonTemplateEngine;
