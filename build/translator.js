"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonTemplateTranslator = void 0;
const constants_1 = require("./constants");
const translator_1 = require("./errors/translator");
const operators_1 = require("./operators");
const types_1 = require("./types");
const common_1 = require("./utils/common");
const translator_2 = require("./utils/translator");
class JsonTemplateTranslator {
    constructor(expr) {
        this.vars = [];
        this.lastVarId = 0;
        this.unusedVars = [];
        this.standardFunctions = {};
        this.expr = expr;
    }
    init() {
        this.vars = [];
        this.lastVarId = 0;
        this.unusedVars = [];
    }
    acquireVar() {
        if (this.unusedVars.length) {
            return this.unusedVars.shift();
        }
        const varName = `${constants_1.VARS_PREFIX}${++this.lastVarId}`;
        this.vars.push(varName);
        return varName;
    }
    acquireVars(numVars = 1) {
        const vars = [];
        for (let i = 0; i < numVars; i++) {
            vars.push(this.acquireVar());
        }
        return vars;
    }
    releaseVars(...args) {
        let i = args.length;
        while (i--) {
            this.unusedVars.push(args[i]);
        }
    }
    translate(dest = constants_1.RESULT_KEY, ctx = constants_1.DATA_PARAM_KEY) {
        this.init();
        const code = [];
        const exprCode = this.translateExpr(this.expr, dest, ctx);
        const functions = Object.values(this.standardFunctions);
        if (functions.length > 0) {
            code.push(functions.join('').replace(/\s+/g, ' '));
        }
        code.push(`let ${dest};`);
        code.push(this.vars.map((elm) => `let ${elm};`).join(''));
        code.push(exprCode);
        code.push(`
      if (!Array.isArray(${dest})) {
        ${dest} = [${dest}];
      }
    `);
        code.push(`return ${dest};`);
        return code.join('');
    }
    translateExpr(expr, dest, ctx) {
        switch (expr.type) {
            case types_1.SyntaxType.STATEMENTS_EXPR:
                return this.translateStatementsExpr(expr, dest, ctx);
            case types_1.SyntaxType.PATH:
                return this.translatePathExpr(expr, dest, ctx);
            case types_1.SyntaxType.IN_EXPR:
                return this.translateINExpr(expr, dest, ctx);
            case types_1.SyntaxType.COMPARISON_EXPR:
            case types_1.SyntaxType.MATH_EXPR:
                return this.translateBinaryExpr(expr, dest, ctx);
            case types_1.SyntaxType.LOGICAL_COALESCE_EXPR:
            case types_1.SyntaxType.LOGICAL_AND_EXPR:
            case types_1.SyntaxType.LOGICAL_OR_EXPR:
                return this.translateLogicalExpr(expr, dest, ctx);
            case types_1.SyntaxType.UNARY_EXPR:
                return this.translateUnaryExpr(expr, dest, ctx);
            case types_1.SyntaxType.LAMBDA_ARG:
                return this.translateLambdaArgExpr(expr, dest, ctx);
            case types_1.SyntaxType.SPREAD_EXPR:
                return this.translateSpreadExpr(expr, dest, ctx);
            case types_1.SyntaxType.INCREMENT:
                return this.translateIncrementExpr(expr, dest, ctx);
            case types_1.SyntaxType.LITERAL:
                return this.translateLiteralExpr(expr, dest, ctx);
            case types_1.SyntaxType.ARRAY_EXPR:
                return this.translateArrayExpr(expr, dest, ctx);
            case types_1.SyntaxType.OBJECT_EXPR:
                return this.translateObjectExpr(expr, dest, ctx);
            case types_1.SyntaxType.BLOCK_EXPR:
                return this.translateBlockExpr(expr, dest, ctx);
            case types_1.SyntaxType.LOOP_EXPR:
                return this.translateLoopExpr(expr, dest, ctx);
            case types_1.SyntaxType.LOOP_CONTROL_EXPR:
                return this.translateLoopControlExpr(expr, dest, ctx);
            case types_1.SyntaxType.FUNCTION_EXPR:
                return this.translateFunctionExpr(expr, dest, ctx);
            case types_1.SyntaxType.FUNCTION_CALL_EXPR:
                return this.translateFunctionCallExpr(expr, dest, ctx);
            case types_1.SyntaxType.DEFINITION_EXPR:
                return this.translateDefinitionExpr(expr, dest, ctx);
            case types_1.SyntaxType.ASSIGNMENT_EXPR:
                return this.translateAssignmentExpr(expr, dest, ctx);
            case types_1.SyntaxType.OBJECT_FILTER_EXPR:
                return this.translateObjectFilterExpr(expr, dest, ctx);
            case types_1.SyntaxType.ARRAY_FILTER_EXPR:
                return this.translateArrayFilterExpr(expr, dest, ctx);
            case types_1.SyntaxType.OBJECT_INDEX_FILTER_EXPR:
                return this.translateIndexFilterExpr(expr, dest, ctx);
            case types_1.SyntaxType.SELECTOR:
                return this.translateSelector(expr, dest, ctx);
            case types_1.SyntaxType.CONDITIONAL_EXPR:
                return this.translateConditionalExpr(expr, dest, ctx);
            case types_1.SyntaxType.RETURN_EXPR:
                return this.translateReturnExpr(expr, dest, ctx);
            case types_1.SyntaxType.THROW_EXPR:
                return this.translateThrowExpr(expr, dest, ctx);
            default:
                return '';
        }
    }
    translateLoopControlExpr(expr, _dest, _ctx) {
        return `${expr.control};`;
    }
    translateIncrementExpr(expr, dest, _ctx) {
        const code = [];
        let incrementCode = `${expr.op}${expr.id};`;
        if (expr.postfix) {
            incrementCode = `${expr.id}${expr.op};`;
        }
        code.push(JsonTemplateTranslator.generateAssignmentCode(dest, incrementCode));
        return code.join('');
    }
    translateLoopExpr(expr, dest, ctx) {
        const code = [];
        const init = this.acquireVar();
        const test = this.acquireVar();
        const update = this.acquireVar();
        const body = this.acquireVar();
        const iterator = this.acquireVar();
        if (expr.init) {
            code.push(this.translateExpr(expr.init, init, ctx));
        }
        code.push(`for(let ${iterator}=0;;${iterator}++){`);
        if (expr.update) {
            code.push(`if(${iterator} > 0) {`);
            code.push(this.translateExpr(expr.update, update, ctx));
            code.push('}');
        }
        if (expr.test) {
            code.push(this.translateExpr(expr.test, test, ctx));
            code.push(`if(!${test}){break;}`);
        }
        code.push(this.translateExpr(expr.body, body, ctx));
        code.push(`}`);
        JsonTemplateTranslator.generateAssignmentCode(dest, body);
        this.releaseVars(iterator, body, update, test, init);
        return code.join('');
    }
    translateThrowExpr(expr, _dest, ctx) {
        const code = [];
        const value = this.acquireVar();
        code.push(this.translateExpr(expr.value, value, ctx));
        code.push(`throw ${value};`);
        this.releaseVars(value);
        return code.join('');
    }
    translateReturnExpr(expr, _dest, ctx) {
        const code = [];
        if (expr.value) {
            const value = this.acquireVar();
            code.push(this.translateExpr(expr.value, value, ctx));
            code.push(`return ${value};`);
            this.releaseVars(value);
        }
        code.push(`return;`);
        return code.join('');
    }
    translateConditionalExpr(expr, dest, ctx) {
        const code = [];
        const ifVar = this.acquireVar();
        code.push(this.translateExpr(expr.if, ifVar, ctx));
        code.push(`if(${ifVar}){`);
        code.push(this.translateExpr(expr.then, dest, ctx));
        code.push('} else {');
        if (expr.else) {
            code.push(this.translateExpr(expr.else, dest, ctx));
        }
        else {
            code.push(`${dest} = undefined;`);
        }
        code.push('}');
        this.releaseVars(ifVar);
        return code.join('');
    }
    translateLambdaArgExpr(expr, dest, _ctx) {
        return `${dest} = args[${expr.index}];`;
    }
    translateSpreadExpr(expr, dest, ctx) {
        return this.translateExpr(expr.value, dest, ctx);
    }
    translatePathRoot(path, dest, ctx) {
        if (typeof path.root === 'object') {
            return this.translateExpr(path.root, dest, ctx);
        }
        return `${dest} = ${path.root || ctx};`;
    }
    translatePathContextVariables(expr, partNum, item, idx) {
        const options = JsonTemplateTranslator.getPathOptions(expr, partNum);
        const code = [];
        if (options.item) {
            code.push(`let ${options.item} = ${item};`);
        }
        if (options.index) {
            code.push(`let ${options.index} = ${idx};`);
        }
        return code.join('');
    }
    prepareDataForPathPart(expr, partNum, data) {
        const code = [];
        code.push(JsonTemplateTranslator.covertToArrayValue(data));
        if (JsonTemplateTranslator.isArrayFilterExpr(expr.parts[partNum]) ||
            JsonTemplateTranslator.isAllFilterExpr(expr.parts[partNum]) ||
            JsonTemplateTranslator.isToArray(expr, partNum)) {
            code.push(`${data} = [${data}];`);
        }
        return code.join('');
    }
    static isAllFilterExpr(expr) {
        return (expr.type === types_1.SyntaxType.OBJECT_FILTER_EXPR && expr.filter.type === types_1.SyntaxType.ALL_FILTER_EXPR);
    }
    translatePathParts(expr, dest) {
        const { parts } = expr;
        const code = [];
        const numParts = parts.length;
        const dataVars = this.acquireVars(numParts);
        const indexVars = this.acquireVars(numParts);
        const itemVars = this.acquireVars(numParts);
        const result = this.acquireVar();
        code.push(JsonTemplateTranslator.generateAssignmentCode(result, '[]'));
        code.push(JsonTemplateTranslator.generateAssignmentCode(dataVars[0], dest));
        for (let i = 0; i < numParts; i++) {
            const part = parts[i];
            const idx = indexVars[i];
            const item = itemVars[i];
            const data = dataVars[i];
            code.push(this.prepareDataForPathPart(expr, i, data));
            code.push(`for(${idx}=0; ${idx}<${data}.length; ${idx}++) {`);
            code.push(`${item} = ${data}[${idx}];`);
            code.push(this.translatePathContextVariables(expr, i, item, idx));
            code.push(this.translateExpr(part, item, item));
            code.push(`if(${JsonTemplateTranslator.returnIsEmpty(item)}) { continue; }`);
            if (i < numParts - 1) {
                code.push(JsonTemplateTranslator.generateAssignmentCode(dataVars[i + 1], item));
            }
            else {
                code.push(`${result}.push(${item});`);
            }
        }
        for (let i = 0; i < numParts; i++) {
            code.push('}');
        }
        this.releaseVars(...indexVars);
        this.releaseVars(...itemVars);
        this.releaseVars(...dataVars);
        this.releaseVars(result);
        if (!expr.returnAsArray) {
            code.push(JsonTemplateTranslator.convertToSingleValueIfSafe(result));
        }
        code.push(JsonTemplateTranslator.generateAssignmentCode(dest, result));
        return code.join('');
    }
    translateSimplePathExpr(expr, dest, ctx) {
        const code = [];
        let currCtx = ctx;
        if (typeof expr.root === 'object') {
            code.push(this.translateExpr(expr.root, dest, ctx));
            currCtx = dest;
        }
        else if (expr.root) {
            currCtx = expr.root;
        }
        const simplePath = this.translateToSimplePath(expr, code, currCtx);
        code.push(JsonTemplateTranslator.generateAssignmentCode(dest, simplePath));
        if (expr.returnAsArray) {
            code.push(JsonTemplateTranslator.covertToArrayValue(dest));
        }
        return code.join('');
    }
    translatePathExpr(expr, dest, ctx) {
        if (expr.inferredPathType === types_1.PathType.SIMPLE) {
            return this.translateSimplePathExpr(expr, dest, ctx);
        }
        const code = [];
        code.push(this.translatePathRoot(expr, dest, ctx));
        if (expr.parts.length > 0) {
            code.push(this.translatePathParts(expr, dest));
        }
        else if (expr.returnAsArray) {
            code.push(JsonTemplateTranslator.covertToArrayValue(dest));
        }
        return code.join('');
    }
    translateCurrentSelector(expr, dest, ctx) {
        const code = [];
        const prop = expr.prop?.value;
        if (prop === '*') {
            const valuesCode = JsonTemplateTranslator.returnObjectValues(ctx);
            code.push(`${dest} = ${valuesCode}.flat();`);
        }
        else if (prop) {
            const escapedPropName = (0, common_1.escapeStr)(prop);
            code.push(`if(${ctx} && Object.prototype.hasOwnProperty.call(${ctx}, ${escapedPropName})){`);
            code.push(`${dest}=${ctx}[${escapedPropName}];`);
            code.push('} else {');
            code.push(`${dest} = undefined;`);
            code.push('}');
        }
        return code.join('');
    }
    translateSelector(expr, dest, ctx) {
        if (expr.selector === '.') {
            return this.translateCurrentSelector(expr, dest, ctx);
        }
        return this.translateDescendantSelector(expr, dest, ctx);
    }
    translateDescendantSelector(expr, dest, baseCtx) {
        const code = [];
        const ctxs = this.acquireVar();
        const currCtx = this.acquireVar();
        const result = this.acquireVar();
        code.push(JsonTemplateTranslator.generateAssignmentCode(result, '[]'));
        const { prop } = expr;
        const propStr = (0, common_1.escapeStr)(prop?.value);
        code.push(`${ctxs}=[${baseCtx}];`);
        code.push(`while(${ctxs}.length > 0) {`);
        code.push(`${currCtx} = ${ctxs}.shift();`);
        code.push(`if(${JsonTemplateTranslator.returnIsEmpty(currCtx)}){continue;}`);
        code.push(`if(Array.isArray(${currCtx})){`);
        code.push(`${ctxs} = ${ctxs}.concat(${currCtx});`);
        code.push('continue;');
        code.push('}');
        code.push(`if(typeof ${currCtx} === "object") {`);
        const valuesCode = JsonTemplateTranslator.returnObjectValues(currCtx);
        code.push(`${ctxs} = ${ctxs}.concat(${valuesCode});`);
        if (prop) {
            if (prop?.value === '*') {
                code.push(`${result} = ${result}.concat(${valuesCode});`);
            }
            else {
                code.push(`if(Object.prototype.hasOwnProperty.call(${currCtx}, ${propStr})){`);
                code.push(`${result} = ${result}.concat(${currCtx}[${propStr}]);`);
                code.push('}');
            }
        }
        code.push('}');
        if (!prop) {
            code.push(`${result}.push(${currCtx});`);
        }
        code.push('}');
        code.push(`${dest} = ${result}.flat();`);
        return code.join('');
    }
    translateBlockExpr(expr, dest, ctx) {
        if (expr.statements.length === 1) {
            return this.translateExpr(expr.statements[0], dest, ctx);
        }
        const fnExpr = {
            type: types_1.SyntaxType.FUNCTION_EXPR,
            body: (0, common_1.convertToStatementsExpr)(...expr.statements),
            block: true,
        };
        return this.translateExpr(fnExpr, dest, ctx);
    }
    translateFunctionExpr(expr, dest, ctx) {
        const code = [];
        const fnHead = expr.async ? 'async function' : 'function';
        code.push(dest, '=', fnHead, '(', (expr.params || []).join(','), '){');
        const fnTranslator = new JsonTemplateTranslator(expr.body);
        code.push(fnTranslator.translate(constants_1.FUNCTION_RESULT_KEY, ctx));
        code.push('}');
        if (expr.block) {
            code.push('()');
        }
        code.push(';');
        return code.join('');
    }
    getFunctionName(expr, ctx) {
        if (expr.object) {
            return expr.id ? `${ctx}.${expr.id}` : ctx;
        }
        if (expr.parent) {
            return expr.id ? `${expr.parent}.${expr.id}` : expr.parent;
        }
        return expr.id;
    }
    translateFunctionCallExpr(expr, dest, ctx) {
        const code = [];
        const result = this.acquireVar();
        code.push(JsonTemplateTranslator.generateAssignmentCode(result, ctx));
        if (expr.object) {
            code.push(this.translateExpr(expr.object, result, ctx));
            code.push(`if(${JsonTemplateTranslator.returnIsNotEmpty(result)}){`);
        }
        const functionArgsStr = this.translateSpreadableExpressions(expr.args, result, code);
        const functionName = this.getFunctionName(expr, result);
        if (expr.id && (0, operators_1.isStandardFunction)(expr.id)) {
            this.standardFunctions[expr.id] = operators_1.standardFunctions[expr.id];
            code.push(`if(${functionName} && typeof ${functionName} === 'function'){`);
            code.push(result, '=', functionName, '(', functionArgsStr, ');');
            code.push('} else {');
            code.push(result, '=', constants_1.VARS_PREFIX, expr.id, '(', expr.parent ?? result, ',', functionArgsStr, ');');
            code.push('}');
        }
        else {
            code.push(result, '=', functionName, '(', functionArgsStr, ');');
        }
        if (expr.object) {
            code.push('}');
        }
        code.push(JsonTemplateTranslator.generateAssignmentCode(dest, result));
        this.releaseVars(result);
        return code.join('');
    }
    translateObjectContextProp(expr, dest, ctx, vars = []) {
        const code = [];
        code.push(JsonTemplateTranslator.generateAssignmentCode(dest, '{}'));
        const keyVar = this.acquireVar();
        const valueVar = this.acquireVar();
        vars.push(keyVar, valueVar);
        code.push(`for(let [${constants_1.VARS_PREFIX}key, ${constants_1.VARS_PREFIX}value] of Object.entries(${ctx})){`);
        code.push(JsonTemplateTranslator.generateAssignmentCode(expr.contextVar, `{key:${constants_1.VARS_PREFIX}key,value:${constants_1.VARS_PREFIX}value}`));
        code.push(this.translateExpr(expr.key, keyVar, ctx));
        code.push(this.translateExpr(expr.value, valueVar, ctx));
        code.push(`${dest}[${keyVar}] = ${valueVar};`);
        code.push('}');
        return code.join('');
    }
    translateObjectExpr(expr, dest, ctx) {
        const code = [];
        const propExprs = [];
        const vars = [];
        for (const prop of expr.props) {
            const propParts = [];
            if (prop.contextVar) {
                const propWithContextVar = this.acquireVar();
                code.push(this.translateObjectContextProp(prop, propWithContextVar, ctx));
                propExprs.push(`...${propWithContextVar}`);
            }
            else {
                if (prop.key) {
                    if (typeof prop.key !== 'string') {
                        const keyVar = this.acquireVar();
                        code.push(this.translateExpr(prop.key, keyVar, ctx));
                        propParts.push(`[${keyVar}]`);
                        vars.push(keyVar);
                    }
                    else {
                        propParts.push((0, common_1.escapeStr)(prop.key));
                    }
                    propParts.push(':');
                }
                const valueVar = this.acquireVar();
                code.push(this.translateExpr(prop.value, valueVar, ctx));
                if (prop.value.type === types_1.SyntaxType.SPREAD_EXPR) {
                    propParts.push('...');
                }
                propParts.push(valueVar);
                propExprs.push(propParts.join(''));
                vars.push(valueVar);
            }
        }
        code.push(JsonTemplateTranslator.generateAssignmentCode(dest, `{${propExprs.join(',')}}`));
        this.releaseVars(...vars);
        return code.join('');
    }
    translateSpreadableExpressions(items, ctx, code) {
        const vars = [];
        const itemParts = [];
        for (const item of items) {
            const varName = this.acquireVar();
            code.push(this.translateExpr(item, varName, ctx));
            itemParts.push(item.type === types_1.SyntaxType.SPREAD_EXPR ? `...${varName}` : varName);
            vars.push(varName);
        }
        this.releaseVars(...vars);
        return itemParts.join(',');
    }
    translateArrayExpr(expr, dest, ctx) {
        const code = [];
        const elementsStr = this.translateSpreadableExpressions(expr.elements, ctx, code);
        code.push(`${dest} = [${elementsStr}];`);
        return code.join('');
    }
    translateLiteralExpr(expr, dest, _ctx) {
        const literalCode = (0, translator_2.translateLiteral)(expr.tokenType, expr.value);
        return JsonTemplateTranslator.generateAssignmentCode(dest, literalCode);
    }
    getSimplePathSelector(expr, isAssignment) {
        if (expr.prop?.type === types_1.TokenType.STR) {
            return `${isAssignment ? '' : '?.'}[${(0, common_1.escapeStr)(expr.prop?.value)}]`;
        }
        return `${isAssignment ? '' : '?'}.${expr.prop?.value}`;
    }
    getSimplePathArrayIndex(expr, ctx, code, keyVars, isAssignment) {
        const parts = [];
        const prefix = isAssignment ? '' : '?.';
        const filter = expr.filter;
        const keyVar = this.acquireVar();
        code.push(this.translateExpr(filter.indexes.elements[0], keyVar, ctx));
        parts.push(`${prefix}[${keyVar}]`);
        keyVars.push(keyVar);
        return parts.join('');
    }
    translateToSimplePath(expr, code, ctx, isAssignment = false) {
        const simplePath = [];
        simplePath.push(ctx);
        const keyVars = [];
        for (const part of expr.parts) {
            if (part.type === types_1.SyntaxType.SELECTOR) {
                simplePath.push(this.getSimplePathSelector(part, isAssignment));
            }
            else {
                simplePath.push(this.getSimplePathArrayIndex(part, ctx, code, keyVars, isAssignment));
            }
        }
        this.releaseVars(...keyVars);
        return simplePath.join('');
    }
    translateAssignmentExpr(expr, _dest, ctx) {
        const code = [];
        const valueVar = this.acquireVar();
        code.push(this.translateExpr(expr.value, valueVar, ctx));
        const assignmentPath = this.translateToSimplePath(expr.path, code, expr.path.root, true);
        JsonTemplateTranslator.ValidateAssignmentPath(assignmentPath);
        code.push(JsonTemplateTranslator.generateAssignmentCode(assignmentPath, valueVar, expr.op));
        this.releaseVars(valueVar);
        return code.join('');
    }
    translateDefinitionVars(expr) {
        const vars = [expr.vars.join(',')];
        if (expr.fromObject) {
            vars.unshift('{');
            vars.push('}');
        }
        return vars.join('');
    }
    translateDefinitionExpr(expr, dest, ctx) {
        const code = [];
        const value = this.acquireVar();
        code.push(this.translateExpr(expr.value, value, ctx));
        const defVars = this.translateDefinitionVars(expr);
        code.push(`${expr.definition} ${defVars}=${value};`);
        code.push(JsonTemplateTranslator.generateAssignmentCode(dest, value));
        this.releaseVars(value);
        return code.join('');
    }
    translateStatementsExpr(expr, dest, ctx) {
        return this.translateStatements(expr.statements, dest, ctx);
    }
    translateStatements(statements, dest, ctx) {
        return statements.map((statement) => this.translateExpr(statement, dest, ctx)).join('');
    }
    getLogicalConditionCode(type, varName) {
        switch (type) {
            case types_1.SyntaxType.LOGICAL_COALESCE_EXPR:
                return `${varName} !== null && ${varName} !== undefined`;
            case types_1.SyntaxType.LOGICAL_OR_EXPR:
                return varName;
            default:
                return `!${varName}`;
        }
    }
    translateLogicalExpr(expr, dest, ctx) {
        const val1 = this.acquireVar();
        const code = [];
        code.push(this.translateExpr(expr.args[0], val1, ctx));
        const condition = this.getLogicalConditionCode(expr.type, val1);
        code.push(`if(${condition}) {`);
        code.push(JsonTemplateTranslator.generateAssignmentCode(dest, val1));
        code.push('} else {');
        const val2 = this.acquireVar();
        code.push(this.translateExpr(expr.args[1], val2, ctx));
        code.push(JsonTemplateTranslator.generateAssignmentCode(dest, val2));
        code.push('}');
        this.releaseVars(val1, val2);
        return code.join('');
    }
    translateINExpr(expr, dest, ctx) {
        const code = [];
        const val1 = this.acquireVar();
        const val2 = this.acquireVar();
        const resultVar = this.acquireVar();
        code.push(this.translateExpr(expr.args[0], val1, ctx));
        code.push(this.translateExpr(expr.args[1], val2, ctx));
        code.push(`if(typeof ${val2} === 'object'){`);
        const inCode = `(Array.isArray(${val2}) ? ${val2}.includes(${val1}) : ${val1} in ${val2})`;
        code.push(JsonTemplateTranslator.generateAssignmentCode(resultVar, inCode));
        code.push('} else {');
        code.push(JsonTemplateTranslator.generateAssignmentCode(resultVar, 'false'));
        code.push('}');
        code.push(JsonTemplateTranslator.generateAssignmentCode(dest, resultVar));
        return code.join('');
    }
    translateUnaryExpr(expr, dest, ctx) {
        const code = [];
        const val = this.acquireVar();
        code.push(this.translateExpr(expr.arg, val, ctx));
        code.push(`${dest} = ${expr.op} ${val};`);
        this.releaseVars(val);
        return code.join('');
    }
    translateArrayFilterExpr(expr, dest, ctx) {
        const code = [];
        if (expr.filter.type === types_1.SyntaxType.ARRAY_INDEX_FILTER_EXPR) {
            code.push(this.translateIndexFilterExpr(expr.filter, dest, ctx));
        }
        else if (expr.filter.type === types_1.SyntaxType.RANGE_FILTER_EXPR) {
            code.push(this.translateRangeFilterExpr(expr.filter, dest, ctx));
        }
        return code.join('');
    }
    translateObjectFilterExpr(expr, dest, ctx) {
        const code = [];
        if (expr.filter.type !== types_1.SyntaxType.ALL_FILTER_EXPR) {
            const condition = this.acquireVar();
            code.push(JsonTemplateTranslator.generateAssignmentCode(condition, 'true'));
            code.push(this.translateExpr(expr.filter, condition, ctx));
            code.push(`if(!${condition}) {${dest} = undefined;}`);
            this.releaseVars(condition);
        }
        return code.join('');
    }
    translateObjectIndexFilterExpr(ctx, allKeys, resultVar, shouldExclude) {
        const code = [];
        if (shouldExclude) {
            code.push(`${allKeys}=Object.keys(${ctx}).filter(key => !${allKeys}.includes(key));`);
        }
        code.push(JsonTemplateTranslator.generateAssignmentCode(resultVar, '{}'));
        code.push(`for(let key of ${allKeys}){`);
        code.push(`if(Object.prototype.hasOwnProperty.call(${ctx}, key)){${resultVar}[key] = ${ctx}[key];}`);
        code.push('}');
        return code.join('');
    }
    translateArrayIndexFilterExpr(ctx, allKeys, resultVar) {
        const code = [];
        code.push(JsonTemplateTranslator.generateAssignmentCode(resultVar, '[]'));
        code.push(`for(let key of ${allKeys}){`);
        code.push(`if(typeof key === 'string'){`);
        code.push(`for(let childCtx of ${ctx}){`);
        code.push(`if(Object.prototype.hasOwnProperty.call(childCtx, key)){`);
        code.push(`${resultVar}.push(childCtx[key]);`);
        code.push('}');
        code.push('}');
        code.push('} else {');
        code.push(`if(key < 0){key = ${ctx}.length + key;}`);
        code.push(`if(Object.prototype.hasOwnProperty.call(${ctx}, key)){`);
        code.push(`${resultVar}.push(${ctx}[key]);`);
        code.push('}');
        code.push('}');
        code.push('}');
        code.push(`if(${allKeys}.length === 1) {${resultVar} = ${resultVar}[0];}`);
        return code.join('');
    }
    translateIndexFilterExpr(expr, dest, ctx) {
        const code = [];
        const allKeys = this.acquireVar();
        code.push(this.translateArrayExpr(expr.indexes, allKeys, ctx));
        code.push(`${allKeys} = ${allKeys}.flat();`);
        const resultVar = this.acquireVar();
        if (expr.type === types_1.SyntaxType.OBJECT_INDEX_FILTER_EXPR) {
            code.push(this.translateObjectIndexFilterExpr(ctx, allKeys, resultVar, expr.exclude));
        }
        else {
            code.push(this.translateArrayIndexFilterExpr(ctx, allKeys, resultVar));
        }
        code.push(JsonTemplateTranslator.generateAssignmentCode(dest, resultVar));
        this.releaseVars(allKeys);
        this.releaseVars(resultVar);
        return code.join('');
    }
    translateRangeFilterExpr(expr, dest, ctx) {
        const code = [];
        const fromIdx = this.acquireVar();
        const toIdx = this.acquireVar();
        if (expr.fromIdx) {
            if (expr.toIdx) {
                code.push(this.translateExpr(expr.fromIdx, fromIdx, ctx));
                code.push(this.translateExpr(expr.toIdx, toIdx, ctx));
                code.push(dest, '=', ctx, '.slice(', fromIdx, ',', toIdx, ');');
            }
            else {
                code.push(this.translateExpr(expr.fromIdx, fromIdx, ctx));
                code.push(dest, '=', ctx, '.slice(', fromIdx, ');');
            }
        }
        else if (expr.toIdx) {
            code.push(this.translateExpr(expr.toIdx, toIdx, ctx));
            code.push(dest, '=', ctx, '.slice(0,', toIdx, ');');
        }
        this.releaseVars(fromIdx, toIdx);
        return code.join('');
    }
    translateBinaryExpr(expr, dest, ctx) {
        const val1 = this.acquireVar();
        const val2 = this.acquireVar();
        const { args } = expr;
        const code = [];
        code.push(this.translateExpr(args[0], val1, ctx));
        code.push(this.translateExpr(args[1], val2, ctx));
        code.push(dest, '=', operators_1.binaryOperators[expr.op](val1, val2), ';');
        this.releaseVars(val1, val2);
        return code.join('');
    }
    static ValidateAssignmentPath(path) {
        if (path.startsWith(constants_1.BINDINGS_PARAM_KEY) && !path.startsWith(constants_1.BINDINGS_CONTEXT_KEY)) {
            throw new translator_1.JsonTemplateTranslatorError(`Invalid assignment path at${path}`);
        }
    }
    static getPathOptions(expr, partNum) {
        return (partNum === 0 ? expr.options : expr.parts[partNum - 1]?.options) || {};
    }
    static isToArray(expr, partNum) {
        return this.getPathOptions(expr, partNum).toArray === true;
    }
    static isArrayFilterExpr(expr) {
        return expr.type === types_1.SyntaxType.ARRAY_FILTER_EXPR;
    }
    static returnIsEmpty(varName) {
        return `${varName} === null || ${varName} === undefined`;
    }
    static returnIsNotEmpty(varName) {
        return `${varName} !== null && ${varName} !== undefined`;
    }
    static returnObjectValues(varName) {
        return `Object.values(${varName}).filter(v => v !== null && v !== undefined)`;
    }
    static convertToSingleValueIfSafe(varName) {
        return `${varName} = ${varName}.length < 2 ? ${varName}[0] : ${varName};`;
    }
    static covertToArrayValue(varName) {
        const code = [];
        code.push(`if(${JsonTemplateTranslator.returnIsNotEmpty(varName)}){`);
        code.push(`${varName} = Array.isArray(${varName}) ? ${varName} : [${varName}];`);
        code.push('}');
        return code.join('');
    }
    static generateAssignmentCode(key, val, op = '=') {
        return `${key}${op}${val};`;
    }
}
exports.JsonTemplateTranslator = JsonTemplateTranslator;
