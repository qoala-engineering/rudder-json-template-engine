import { EngineOptions, Expression, FlatMappingPaths, TemplateInput } from './types';
export declare class JsonTemplateEngine {
    private readonly fn;
    private constructor();
    private static compileAsSync;
    private static compileAsAsync;
    private static translateExpression;
    static isValidJSONPath(path?: string): boolean;
    private static prepareMappings;
    static validateMappings(mappings: FlatMappingPaths[], options?: EngineOptions): void;
    private static createFlatMappingsAST;
    static parseMappingPaths(mappings: FlatMappingPaths[], options?: EngineOptions): Expression;
    static create(templateOrExpr: TemplateInput, options?: EngineOptions): JsonTemplateEngine;
    static createAsSync(template: TemplateInput, options?: EngineOptions): JsonTemplateEngine;
    static parse(template: TemplateInput, options?: EngineOptions): Expression;
    static translate(template: TemplateInput, options?: EngineOptions): string;
    static reverseTranslate(expr: Expression | FlatMappingPaths[], options?: EngineOptions): string;
    static convertMappingsToTemplate(mappings: FlatMappingPaths[], options?: EngineOptions): string;
    static evaluateAsSync(template: TemplateInput, options?: EngineOptions, data?: unknown, bindings?: Record<string, unknown>): unknown;
    static evaluate(template: TemplateInput, options?: EngineOptions, data?: unknown, bindings?: Record<string, unknown>): unknown;
    evaluate(data?: unknown, bindings?: Record<string, unknown>): unknown;
}
//# sourceMappingURL=engine.d.ts.map