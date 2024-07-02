"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonTemplateParser = void 0;
/* eslint-disable import/no-cycle */
const constants_1 = require("./constants");
const engine_1 = require("./engine");
const parser_1 = require("./errors/parser");
const lexer_1 = require("./errors/lexer");
const lexer_2 = require("./lexer");
const types_1 = require("./types");
const common_1 = require("./utils/common");
class JsonTemplateParser {
    constructor(lexer, options) {
        this.pathTypesStack = [];
        // indicates currently how many loops being parsed
        this.loopCount = 0;
        this.lexer = lexer;
        this.options = options;
    }
    parse() {
        this.lexer.init();
        return this.parseStatementsExpr();
    }
    parseEndOfStatement(blockEnd) {
        if (this.lexer.matchEOT() || this.lexer.match(blockEnd)) {
            return;
        }
        if (this.lexer.match(';')) {
            this.lexer.ignoreTokens(1);
            return;
        }
        const currIdx = this.lexer.currentIndex();
        const nextTokenStart = this.lexer.lookahead().range[0];
        const code = this.lexer.getCode(currIdx, nextTokenStart);
        if (!code.includes('\n')) {
            this.lexer.throwUnexpectedToken();
        }
    }
    parseStatements(blockEnd) {
        const statements = [];
        while (!this.lexer.matchEOT() && !this.lexer.match(blockEnd)) {
            statements.push(this.parseStatementExpr());
            this.parseEndOfStatement(blockEnd);
        }
        return statements;
    }
    static validateStatements(statements, options) {
        if (!statements.length) {
            if (options?.parentType === types_1.SyntaxType.CONDITIONAL_EXPR ||
                options?.parentType === types_1.SyntaxType.LOOP_EXPR) {
                throw new parser_1.JsonTemplateParserError('Empty statements are not allowed in loop and condtional expressions');
            }
            return;
        }
        for (let i = 0; i < statements.length; i += 1) {
            const currStatement = statements[i];
            if ((currStatement.type === types_1.SyntaxType.RETURN_EXPR ||
                currStatement.type === types_1.SyntaxType.THROW_EXPR ||
                currStatement.type === types_1.SyntaxType.LOOP_CONTROL_EXPR) &&
                (options?.parentType !== types_1.SyntaxType.CONDITIONAL_EXPR || i !== statements.length - 1)) {
                throw new parser_1.JsonTemplateParserError('return, throw, continue and break statements are only allowed as last statements in conditional expressions');
            }
        }
    }
    parseStatementsExpr(options) {
        const statements = this.parseStatements(options?.blockEnd);
        JsonTemplateParser.validateStatements(statements, options);
        return {
            type: types_1.SyntaxType.STATEMENTS_EXPR,
            statements,
        };
    }
    parseStatementExpr() {
        return this.parseBaseExpr();
    }
    parseAssignmentExpr() {
        const expr = this.parseNextExpr(types_1.OperatorType.ASSIGNMENT);
        if (expr.type === types_1.SyntaxType.PATH && this.lexer.matchAssignment()) {
            const op = this.lexer.value();
            const path = expr;
            if (!path.root || typeof path.root === 'object' || path.root === constants_1.DATA_PARAM_KEY) {
                throw new parser_1.JsonTemplateParserError('Invalid assignment path');
            }
            if (!JsonTemplateParser.isSimplePath(expr)) {
                throw new parser_1.JsonTemplateParserError('Invalid assignment path');
            }
            path.inferredPathType = types_1.PathType.SIMPLE;
            return {
                type: types_1.SyntaxType.ASSIGNMENT_EXPR,
                value: this.parseBaseExpr(),
                op,
                path,
            };
        }
        return expr;
    }
    parseBaseExpr() {
        const startIdx = this.lexer.currentIndex();
        try {
            return this.parseNextExpr(types_1.OperatorType.BASE);
        }
        catch (error) {
            const code = this.lexer.getCode(startIdx, this.lexer.currentIndex());
            if (error.message.includes('at')) {
                throw error;
            }
            throw new parser_1.JsonTemplateParserError(`${error.message} at ${code}`);
        }
    }
    parseNextExpr(currentOperation) {
        switch (currentOperation) {
            case types_1.OperatorType.CONDITIONAL:
                return this.parseAssignmentExpr();
            case types_1.OperatorType.ASSIGNMENT:
                return this.parseCoalesceExpr();
            case types_1.OperatorType.COALESCING:
                return this.parseLogicalORExpr();
            case types_1.OperatorType.OR:
                return this.parseLogicalANDExpr();
            case types_1.OperatorType.AND:
                return this.parseEqualityExpr();
            case types_1.OperatorType.EQUALITY:
                return this.parseRelationalExpr();
            case types_1.OperatorType.RELATIONAL:
                return this.parseShiftExpr();
            case types_1.OperatorType.SHIFT:
                return this.parseAdditiveExpr();
            case types_1.OperatorType.ADDITION:
                return this.parseMultiplicativeExpr();
            case types_1.OperatorType.MULTIPLICATION:
                return this.parsePowerExpr();
            case types_1.OperatorType.POWER:
                return this.parseUnaryExpr();
            case types_1.OperatorType.UNARY:
                return this.parsePrefixIncreamentExpr();
            case types_1.OperatorType.PREFIX_INCREMENT:
                return this.parsePostfixIncreamentExpr();
            case types_1.OperatorType.POSTFIX_INCREMENT:
                return this.parsePathAfterExpr();
            default:
                return this.parseConditionalExpr();
        }
    }
    parsePathPart() {
        if (this.lexer.match('.()')) {
            this.lexer.ignoreTokens(1);
        }
        else if (this.lexer.match('.') && this.lexer.match('(', 1)) {
            this.lexer.ignoreTokens(1);
            return this.parseBlockExpr();
        }
        else if (this.lexer.match('(')) {
            return this.parseFunctionCallExpr();
        }
        else if (this.lexer.matchPathPartSelector()) {
            return this.parseSelector();
        }
        else if (this.lexer.matchToArray()) {
            return this.parsePathOptions();
        }
        else if (this.lexer.match('{')) {
            return this.parseObjectFiltersExpr();
        }
        else if (this.lexer.match('[')) {
            return this.parseArrayFilterExpr();
        }
        else if (this.lexer.match('@') || this.lexer.match('#')) {
            return this.parsePathOptions();
        }
    }
    parsePathParts() {
        let parts = [];
        let newParts = (0, common_1.toArray)(this.parsePathPart());
        while (newParts) {
            parts = parts.concat(newParts);
            if (newParts[0].type === types_1.SyntaxType.FUNCTION_CALL_EXPR) {
                break;
            }
            newParts = (0, common_1.toArray)(this.parsePathPart());
        }
        return JsonTemplateParser.ignoreEmptySelectors(parts);
    }
    parseContextVariable() {
        this.lexer.ignoreTokens(1);
        if (!this.lexer.matchID()) {
            this.lexer.throwUnexpectedToken();
        }
        return this.lexer.value();
    }
    parsePathOptions() {
        const context = {};
        while (this.lexer.match('@') || this.lexer.match('#') || this.lexer.matchToArray()) {
            if (this.lexer.match('@')) {
                context.item = this.parseContextVariable();
                // eslint-disable-next-line no-continue
                continue;
            }
            if (this.lexer.match('#')) {
                context.index = this.parseContextVariable();
                // eslint-disable-next-line no-continue
                continue;
            }
            if (this.lexer.matchToArray()) {
                this.lexer.ignoreTokens(2);
                context.toArray = true;
            }
        }
        return {
            type: types_1.SyntaxType.PATH_OPTIONS,
            options: context,
        };
    }
    parsePathRoot(pathType, root) {
        if (root) {
            return root;
        }
        const nextToken = this.lexer.lookahead();
        if (nextToken.type === types_1.TokenType.ID && nextToken.value !== '$') {
            return this.lexer.value();
        }
        const tokenReturnValues = {
            '^': constants_1.DATA_PARAM_KEY,
            $: pathType.inferredPathType === types_1.PathType.JSON ? constants_1.DATA_PARAM_KEY : constants_1.BINDINGS_PARAM_KEY,
            '@': undefined,
        };
        if (Object.prototype.hasOwnProperty.call(tokenReturnValues, nextToken.value)) {
            this.lexer.ignoreTokens(1);
            return tokenReturnValues[nextToken.value];
        }
    }
    getInferredPathType() {
        if (this.pathTypesStack.length > 0) {
            return this.pathTypesStack[this.pathTypesStack.length - 1];
        }
        return {
            pathType: types_1.PathType.UNKNOWN,
            inferredPathType: this.options?.defaultPathType ?? types_1.PathType.RICH,
        };
    }
    createPathResult(pathType) {
        return {
            pathType,
            inferredPathType: pathType,
        };
    }
    parsePathType() {
        if (this.lexer.matchSimplePath()) {
            this.lexer.ignoreTokens(1);
            return this.createPathResult(types_1.PathType.SIMPLE);
        }
        if (this.lexer.matchRichPath()) {
            this.lexer.ignoreTokens(1);
            return this.createPathResult(types_1.PathType.RICH);
        }
        if (this.lexer.matchJsonPath()) {
            this.lexer.ignoreTokens(1);
            return this.createPathResult(types_1.PathType.JSON);
        }
        return this.getInferredPathType();
    }
    parsePathTypeExpr() {
        const pathTypeResult = this.parsePathType();
        this.pathTypesStack.push(pathTypeResult);
        const expr = this.parseBaseExpr();
        this.pathTypesStack.pop();
        return expr;
    }
    parsePath(options) {
        const pathTypeResult = this.parsePathType();
        const expr = {
            type: types_1.SyntaxType.PATH,
            root: this.parsePathRoot(pathTypeResult, options?.root),
            parts: this.parsePathParts(),
            ...pathTypeResult,
        };
        if (!expr.parts.length) {
            return JsonTemplateParser.setPathTypeIfNotJSON(expr, types_1.PathType.SIMPLE);
        }
        return this.updatePathExpr(expr);
    }
    static createArrayIndexFilterExpr(expr) {
        return {
            type: types_1.SyntaxType.ARRAY_INDEX_FILTER_EXPR,
            indexes: {
                type: types_1.SyntaxType.ARRAY_EXPR,
                elements: [expr],
            },
        };
    }
    static createArrayFilterExpr(expr) {
        return {
            type: types_1.SyntaxType.ARRAY_FILTER_EXPR,
            filter: expr,
        };
    }
    parseSelector() {
        const selector = this.lexer.value();
        if (this.lexer.matchINT()) {
            return JsonTemplateParser.createArrayFilterExpr(JsonTemplateParser.createArrayIndexFilterExpr(this.parseLiteralExpr()));
        }
        let prop;
        if (this.lexer.match('*') ||
            this.lexer.matchID() ||
            this.lexer.matchKeyword() ||
            this.lexer.matchTokenType(types_1.TokenType.STR)) {
            prop = this.lexer.lex();
            if (prop.type === types_1.TokenType.KEYWORD) {
                prop.type = types_1.TokenType.ID;
            }
        }
        return {
            type: types_1.SyntaxType.SELECTOR,
            selector,
            prop,
        };
    }
    parseRangeFilterExpr() {
        if (this.lexer.match(':')) {
            this.lexer.ignoreTokens(1);
            return {
                type: types_1.SyntaxType.RANGE_FILTER_EXPR,
                toIdx: this.parseBaseExpr(),
            };
        }
        const fromExpr = this.parseBaseExpr();
        if (this.lexer.match(':')) {
            this.lexer.ignoreTokens(1);
            if (this.lexer.match(']')) {
                return {
                    type: types_1.SyntaxType.RANGE_FILTER_EXPR,
                    fromIdx: fromExpr,
                };
            }
            return {
                type: types_1.SyntaxType.RANGE_FILTER_EXPR,
                fromIdx: fromExpr,
                toIdx: this.parseBaseExpr(),
            };
        }
        return fromExpr;
    }
    parseArrayIndexFilterExpr(expr) {
        const parts = [];
        if (expr) {
            parts.push(expr);
            if (!this.lexer.match(']')) {
                this.lexer.expect(',');
            }
        }
        return {
            type: types_1.SyntaxType.ARRAY_INDEX_FILTER_EXPR,
            indexes: {
                type: types_1.SyntaxType.ARRAY_EXPR,
                elements: [
                    ...parts,
                    ...this.parseCommaSeparatedElements(']', () => this.parseSpreadExpr()),
                ],
            },
        };
    }
    parseArrayFilter() {
        if (this.lexer.matchSpread()) {
            return this.parseArrayIndexFilterExpr();
        }
        const expr = this.parseRangeFilterExpr();
        if (expr.type === types_1.SyntaxType.RANGE_FILTER_EXPR) {
            return expr;
        }
        return this.parseArrayIndexFilterExpr(expr);
    }
    parseObjectFilter() {
        let exclude = false;
        if ((this.lexer.match('~') || this.lexer.match('!')) && this.lexer.match('[', 1)) {
            this.lexer.ignoreTokens(1);
            exclude = true;
        }
        if (this.lexer.match('[')) {
            return {
                type: types_1.SyntaxType.OBJECT_INDEX_FILTER_EXPR,
                indexes: this.parseArrayExpr(),
                exclude,
            };
        }
        return {
            type: types_1.SyntaxType.OBJECT_FILTER_EXPR,
            filter: this.parseBaseExpr(),
        };
    }
    parseObjectFiltersExpr() {
        const objectFilters = [];
        const indexFilters = [];
        while (this.lexer.match('{')) {
            this.lexer.expect('{');
            const expr = this.parseObjectFilter();
            if (expr.type === types_1.SyntaxType.OBJECT_INDEX_FILTER_EXPR) {
                indexFilters.push(expr);
            }
            else {
                objectFilters.push(expr.filter);
            }
            this.lexer.expect('}');
            if (this.lexer.match('.') && this.lexer.match('{', 1)) {
                this.lexer.ignoreTokens(1);
            }
        }
        if (!objectFilters.length) {
            return indexFilters;
        }
        const objectFilter = {
            type: types_1.SyntaxType.OBJECT_FILTER_EXPR,
            filter: this.combineExpressionsAsBinaryExpr(objectFilters, types_1.SyntaxType.LOGICAL_AND_EXPR, '&&'),
        };
        return [objectFilter, ...indexFilters];
    }
    parseLoopControlExpr() {
        const control = this.lexer.value();
        if (!this.loopCount) {
            throw new parser_1.JsonTemplateParserError(`encounted loop control outside loop: ${control}`);
        }
        return {
            type: types_1.SyntaxType.LOOP_CONTROL_EXPR,
            control,
        };
    }
    parseCurlyBlockExpr(options) {
        this.lexer.expect('{');
        const expr = this.parseStatementsExpr(options);
        this.lexer.expect('}');
        return expr;
    }
    parseConditionalBodyExpr() {
        const currentIndex = this.lexer.currentIndex();
        if (this.lexer.match('{')) {
            try {
                return this.parseObjectExpr();
            }
            catch (error) {
                if (error instanceof lexer_1.JsonTemplateLexerError) {
                    this.lexer.reset(currentIndex);
                }
                return this.parseCurlyBlockExpr({ blockEnd: '}', parentType: types_1.SyntaxType.CONDITIONAL_EXPR });
            }
        }
        return this.parseBaseExpr();
    }
    parseConditionalExpr() {
        const ifExpr = this.parseNextExpr(types_1.OperatorType.CONDITIONAL);
        if (this.lexer.match('?')) {
            this.lexer.ignoreTokens(1);
            const thenExpr = this.parseConditionalBodyExpr();
            let elseExpr;
            if (this.lexer.match(':')) {
                this.lexer.ignoreTokens(1);
                elseExpr = this.parseConditionalBodyExpr();
            }
            return {
                type: types_1.SyntaxType.CONDITIONAL_EXPR,
                if: ifExpr,
                then: thenExpr,
                else: elseExpr,
            };
        }
        return ifExpr;
    }
    parseLoopExpr() {
        this.loopCount++;
        this.lexer.ignoreTokens(1);
        let init;
        let test;
        let update;
        if (!this.lexer.match('{')) {
            this.lexer.expect('(');
            if (!this.lexer.match(';')) {
                init = this.parseAssignmentExpr();
            }
            this.lexer.expect(';');
            if (!this.lexer.match(';')) {
                test = this.parseLogicalORExpr();
            }
            this.lexer.expect(';');
            if (!this.lexer.match(')')) {
                update = this.parseAssignmentExpr();
            }
            this.lexer.expect(')');
        }
        const body = this.parseCurlyBlockExpr({ blockEnd: '}', parentType: types_1.SyntaxType.LOOP_EXPR });
        this.loopCount--;
        return {
            type: types_1.SyntaxType.LOOP_EXPR,
            init,
            test,
            update,
            body,
        };
    }
    parseJSONObjectFilter() {
        this.lexer.expect('?');
        this.lexer.expect('(');
        const filter = this.parseBaseExpr();
        this.lexer.expect(')');
        return {
            type: types_1.SyntaxType.OBJECT_FILTER_EXPR,
            filter,
        };
    }
    parseAllFilter() {
        this.lexer.expect('*');
        return {
            type: types_1.SyntaxType.OBJECT_FILTER_EXPR,
            filter: {
                type: types_1.SyntaxType.ALL_FILTER_EXPR,
            },
        };
    }
    parseArrayFilterExpr() {
        this.lexer.expect('[');
        let expr;
        if (this.lexer.match('?')) {
            expr = this.parseJSONObjectFilter();
        }
        else if (this.lexer.match('*')) {
            expr = this.parseAllFilter();
        }
        else {
            expr = {
                type: types_1.SyntaxType.ARRAY_FILTER_EXPR,
                filter: this.parseArrayFilter(),
            };
        }
        this.lexer.expect(']');
        return expr;
    }
    combineExpressionsAsBinaryExpr(values, type, op) {
        if (!values?.length) {
            throw new parser_1.JsonTemplateParserError('expected at least 1 expression');
        }
        if (values.length === 1) {
            return values[0];
        }
        return {
            type,
            op,
            args: [values.shift(), this.combineExpressionsAsBinaryExpr(values, type, op)],
        };
    }
    parseArrayCoalesceExpr() {
        this.lexer.ignoreTokens(1);
        const expr = this.parseArrayExpr();
        return this.combineExpressionsAsBinaryExpr(expr.elements, types_1.SyntaxType.LOGICAL_COALESCE_EXPR, '??');
    }
    parseCoalesceExpr() {
        const expr = this.parseNextExpr(types_1.OperatorType.COALESCING);
        if (this.lexer.match('??')) {
            return {
                type: types_1.SyntaxType.LOGICAL_COALESCE_EXPR,
                op: this.lexer.value(),
                args: [expr, this.parseCoalesceExpr()],
            };
        }
        return expr;
    }
    parseLogicalORExpr() {
        const expr = this.parseNextExpr(types_1.OperatorType.OR);
        if (this.lexer.match('||')) {
            return {
                type: types_1.SyntaxType.LOGICAL_OR_EXPR,
                op: this.lexer.value(),
                args: [expr, this.parseLogicalORExpr()],
            };
        }
        return expr;
    }
    parseLogicalANDExpr() {
        const expr = this.parseNextExpr(types_1.OperatorType.AND);
        if (this.lexer.match('&&')) {
            return {
                type: types_1.SyntaxType.LOGICAL_AND_EXPR,
                op: this.lexer.value(),
                args: [expr, this.parseLogicalANDExpr()],
            };
        }
        return expr;
    }
    parseEqualityExpr() {
        const expr = this.parseNextExpr(types_1.OperatorType.EQUALITY);
        if (this.lexer.match('==') ||
            this.lexer.match('!=') ||
            this.lexer.match('===') ||
            this.lexer.match('!==') ||
            this.lexer.match('^==') ||
            this.lexer.match('==^') ||
            this.lexer.match('^=') ||
            this.lexer.match('=^') ||
            this.lexer.match('$==') ||
            this.lexer.match('==$') ||
            this.lexer.match('$=') ||
            this.lexer.match('=$') ||
            this.lexer.match('==*') ||
            this.lexer.match('=~') ||
            this.lexer.match('=*')) {
            return {
                type: types_1.SyntaxType.COMPARISON_EXPR,
                op: this.lexer.value(),
                args: [expr, this.parseEqualityExpr()],
            };
        }
        return expr;
    }
    parseInExpr(expr) {
        this.lexer.ignoreTokens(1);
        return {
            type: types_1.SyntaxType.IN_EXPR,
            op: types_1.Keyword.IN,
            args: [expr, this.parseRelationalExpr()],
        };
    }
    parseRelationalExpr() {
        const expr = this.parseNextExpr(types_1.OperatorType.RELATIONAL);
        if (this.lexer.match('<') ||
            this.lexer.match('>') ||
            this.lexer.match('<=') ||
            this.lexer.match('>=') ||
            this.lexer.matchContains() ||
            this.lexer.matchSize() ||
            this.lexer.matchEmpty() ||
            this.lexer.matchAnyOf() ||
            this.lexer.matchSubsetOf()) {
            return {
                type: types_1.SyntaxType.COMPARISON_EXPR,
                op: this.lexer.value(),
                args: [expr, this.parseRelationalExpr()],
            };
        }
        if (this.lexer.matchIN()) {
            return this.parseInExpr(expr);
        }
        if (this.lexer.matchNotIN()) {
            return {
                type: types_1.SyntaxType.UNARY_EXPR,
                op: '!',
                arg: (0, common_1.createBlockExpression)(this.parseInExpr(expr)),
            };
        }
        if (this.lexer.matchNoneOf()) {
            this.lexer.ignoreTokens(1);
            return {
                type: types_1.SyntaxType.UNARY_EXPR,
                op: '!',
                arg: (0, common_1.createBlockExpression)({
                    type: types_1.SyntaxType.COMPARISON_EXPR,
                    op: types_1.Keyword.ANYOF,
                    args: [expr, this.parseRelationalExpr()],
                }),
            };
        }
        return expr;
    }
    parseShiftExpr() {
        const expr = this.parseNextExpr(types_1.OperatorType.SHIFT);
        if (this.lexer.match('>>') || this.lexer.match('<<')) {
            return {
                type: types_1.SyntaxType.MATH_EXPR,
                op: this.lexer.value(),
                args: [expr, this.parseShiftExpr()],
            };
        }
        return expr;
    }
    parseAdditiveExpr() {
        const expr = this.parseNextExpr(types_1.OperatorType.ADDITION);
        if (this.lexer.match('+') || this.lexer.match('-')) {
            return {
                type: types_1.SyntaxType.MATH_EXPR,
                op: this.lexer.value(),
                args: [expr, this.parseAdditiveExpr()],
            };
        }
        return expr;
    }
    parseMultiplicativeExpr() {
        const expr = this.parseNextExpr(types_1.OperatorType.MULTIPLICATION);
        if (this.lexer.match('*') || this.lexer.match('/') || this.lexer.match('%')) {
            return {
                type: types_1.SyntaxType.MATH_EXPR,
                op: this.lexer.value(),
                args: [expr, this.parseMultiplicativeExpr()],
            };
        }
        return expr;
    }
    parsePowerExpr() {
        const expr = this.parseNextExpr(types_1.OperatorType.POWER);
        if (this.lexer.match('**')) {
            return {
                type: types_1.SyntaxType.MATH_EXPR,
                op: this.lexer.value(),
                args: [expr, this.parsePowerExpr()],
            };
        }
        return expr;
    }
    parsePrefixIncreamentExpr() {
        if (this.lexer.matchIncrement() || this.lexer.matchDecrement()) {
            const op = this.lexer.value();
            if (!this.lexer.matchID()) {
                throw new parser_1.JsonTemplateParserError('Invalid prefix increment expression');
            }
            const id = this.lexer.value();
            return {
                type: types_1.SyntaxType.INCREMENT,
                op,
                id,
            };
        }
        return this.parseNextExpr(types_1.OperatorType.PREFIX_INCREMENT);
    }
    static convertToID(expr) {
        if (expr.type === types_1.SyntaxType.PATH) {
            const path = expr;
            if (!path.root ||
                typeof path.root !== 'string' ||
                path.parts.length !== 0 ||
                path.root === constants_1.DATA_PARAM_KEY ||
                path.root === constants_1.BINDINGS_PARAM_KEY) {
                throw new parser_1.JsonTemplateParserError('Invalid postfix increment expression');
            }
            return path.root;
        }
        throw new parser_1.JsonTemplateParserError('Invalid postfix increment expression');
    }
    parsePostfixIncreamentExpr() {
        const expr = this.parseNextExpr(types_1.OperatorType.POSTFIX_INCREMENT);
        if (this.lexer.matchIncrement() || this.lexer.matchDecrement()) {
            return {
                type: types_1.SyntaxType.INCREMENT,
                op: this.lexer.value(),
                id: JsonTemplateParser.convertToID(expr),
                postfix: true,
            };
        }
        return expr;
    }
    parseUnaryExpr() {
        if (this.lexer.match('!') ||
            this.lexer.match('+') ||
            this.lexer.match('-') ||
            this.lexer.matchTypeOf() ||
            this.lexer.matchAwait()) {
            return {
                type: types_1.SyntaxType.UNARY_EXPR,
                op: this.lexer.value(),
                arg: this.parseUnaryExpr(),
            };
        }
        return this.parseNextExpr(types_1.OperatorType.UNARY);
    }
    shouldSkipPathParsing(expr) {
        switch (expr.type) {
            case types_1.SyntaxType.EMPTY:
            case types_1.SyntaxType.DEFINITION_EXPR:
            case types_1.SyntaxType.ASSIGNMENT_EXPR:
            case types_1.SyntaxType.SPREAD_EXPR:
                return true;
            case types_1.SyntaxType.LITERAL:
            case types_1.SyntaxType.MATH_EXPR:
            case types_1.SyntaxType.COMPARISON_EXPR:
            case types_1.SyntaxType.ARRAY_EXPR:
            case types_1.SyntaxType.OBJECT_EXPR:
                if (this.lexer.match('(')) {
                    return true;
                }
                break;
            case types_1.SyntaxType.FUNCTION_EXPR:
                if (!this.lexer.match('(')) {
                    return true;
                }
                break;
            default: // Expected a default case
                break;
        }
        return false;
    }
    parsePathAfterExpr() {
        let expr = this.parsePrimaryExpr();
        if (this.shouldSkipPathParsing(expr)) {
            return expr;
        }
        while (this.lexer.matchPathType() ||
            this.lexer.matchPathPartSelector() ||
            this.lexer.match('{') ||
            this.lexer.match('[') ||
            this.lexer.match('(')) {
            expr = this.parsePath({ root: expr });
        }
        return expr;
    }
    static createLiteralExpr(token) {
        return {
            type: types_1.SyntaxType.LITERAL,
            value: token.value,
            tokenType: token.type,
        };
    }
    parseLiteralExpr() {
        return JsonTemplateParser.createLiteralExpr(this.lexer.lex());
    }
    parseIDPath() {
        const idParts = [];
        while (this.lexer.matchID()) {
            let idValue = this.lexer.value();
            if (idValue === '$') {
                idValue = constants_1.BINDINGS_PARAM_KEY;
            }
            idParts.push(idValue);
            if (this.lexer.match('.') && this.lexer.matchID(1)) {
                this.lexer.ignoreTokens(1);
            }
        }
        if (!idParts.length) {
            this.lexer.throwUnexpectedToken();
        }
        return idParts.join('.');
    }
    parseObjectDefVars() {
        const vars = [];
        this.lexer.expect('{');
        while (!this.lexer.match('}')) {
            if (!this.lexer.matchID()) {
                throw new parser_1.JsonTemplateParserError('Invalid object vars');
            }
            vars.push(this.lexer.value());
            if (!this.lexer.match('}')) {
                this.lexer.expect(',');
            }
        }
        this.lexer.expect('}');
        if (vars.length === 0) {
            throw new parser_1.JsonTemplateParserError('Empty object vars');
        }
        return vars;
    }
    parseNormalDefVars() {
        const vars = [];
        if (!this.lexer.matchID()) {
            throw new parser_1.JsonTemplateParserError('Invalid normal vars');
        }
        vars.push(this.lexer.value());
        return vars;
    }
    parseDefinitionExpr() {
        const definition = this.lexer.value();
        const fromObject = this.lexer.match('{');
        const vars = fromObject ? this.parseObjectDefVars() : this.parseNormalDefVars();
        this.lexer.expect('=');
        return {
            type: types_1.SyntaxType.DEFINITION_EXPR,
            value: this.parseBaseExpr(),
            vars,
            definition,
            fromObject,
        };
    }
    parseFunctionCallArgs() {
        this.lexer.expect('(');
        const args = this.parseCommaSeparatedElements(')', () => this.parseSpreadExpr());
        this.lexer.expect(')');
        return args;
    }
    parseFunctionCallExpr() {
        let id;
        if (this.lexer.matchNew()) {
            this.lexer.ignoreTokens(1);
            id = `new ${this.parseIDPath()}`;
        }
        return {
            type: types_1.SyntaxType.FUNCTION_CALL_EXPR,
            args: this.parseFunctionCallArgs(),
            id,
        };
    }
    parseFunctionDefinitionParam() {
        let spread = '';
        if (this.lexer.matchSpread()) {
            this.lexer.ignoreTokens(1);
            spread = '...';
            // rest param should be last param.
            if (!this.lexer.match(')', 1)) {
                this.lexer.throwUnexpectedToken();
            }
        }
        if (!this.lexer.matchID()) {
            this.lexer.throwUnexpectedToken();
        }
        return `${spread}${this.lexer.value()}`;
    }
    parseFunctionDefinitionParams() {
        this.lexer.expect('(');
        const params = this.parseCommaSeparatedElements(')', () => this.parseFunctionDefinitionParam());
        this.lexer.expect(')');
        return params;
    }
    parseFunctionExpr(asyncFn = false) {
        this.lexer.ignoreTokens(1);
        const params = this.parseFunctionDefinitionParams();
        return {
            type: types_1.SyntaxType.FUNCTION_EXPR,
            params,
            body: this.parseCurlyBlockExpr({ blockEnd: '}' }),
            async: asyncFn,
        };
    }
    parseObjectKeyExpr() {
        let key;
        if (this.lexer.match('[')) {
            this.lexer.ignoreTokens(1);
            key = this.parseBaseExpr();
            this.lexer.expect(']');
        }
        else if (this.lexer.matchID() || this.lexer.matchKeyword()) {
            key = this.lexer.value();
        }
        else if (this.lexer.matchLiteral() && !this.lexer.matchTokenType(types_1.TokenType.REGEXP)) {
            key = this.lexer.value().toString();
        }
        else {
            this.lexer.throwUnexpectedToken();
        }
        return key;
    }
    parseShortKeyValueObjectPropExpr() {
        if ((this.lexer.matchID() || this.lexer.matchKeyword()) &&
            (this.lexer.match(',', 1) || this.lexer.match('}', 1))) {
            const key = this.lexer.lookahead().value;
            const value = this.parseBaseExpr();
            return {
                type: types_1.SyntaxType.OBJECT_PROP_EXPR,
                key,
                value,
            };
        }
    }
    parseSpreadObjectPropExpr() {
        if (this.lexer.matchSpread()) {
            return {
                type: types_1.SyntaxType.OBJECT_PROP_EXPR,
                value: this.parseSpreadExpr(),
            };
        }
    }
    getObjectPropContextVar() {
        if (this.lexer.matchObjectContextProp()) {
            this.lexer.ignoreTokens(1);
            return this.lexer.value();
        }
    }
    parseNormalObjectPropExpr() {
        const contextVar = this.getObjectPropContextVar();
        const key = this.parseObjectKeyExpr();
        if (contextVar && typeof key === 'string') {
            throw new parser_1.JsonTemplateParserError('Context prop should be used with a key expression');
        }
        this.lexer.expect(':');
        const value = this.parseBaseExpr();
        return {
            type: types_1.SyntaxType.OBJECT_PROP_EXPR,
            key,
            value,
            contextVar,
        };
    }
    parseObjectPropExpr() {
        return (this.parseSpreadObjectPropExpr() ??
            this.parseShortKeyValueObjectPropExpr() ??
            this.parseNormalObjectPropExpr());
    }
    parseObjectExpr() {
        this.lexer.expect('{');
        const props = this.parseCommaSeparatedElements('}', () => this.parseObjectPropExpr());
        this.lexer.expect('}');
        return {
            type: types_1.SyntaxType.OBJECT_EXPR,
            props,
        };
    }
    parseCommaSeparatedElements(blockEnd, parseFn) {
        const elements = [];
        while (!this.lexer.match(blockEnd)) {
            elements.push(parseFn());
            if (!this.lexer.match(blockEnd)) {
                this.lexer.expect(',');
            }
        }
        return elements;
    }
    parseSpreadExpr() {
        if (this.lexer.matchSpread()) {
            this.lexer.ignoreTokens(1);
            return {
                type: types_1.SyntaxType.SPREAD_EXPR,
                value: this.parseBaseExpr(),
            };
        }
        return this.parseBaseExpr();
    }
    parseArrayExpr() {
        this.lexer.expect('[');
        const elements = this.parseCommaSeparatedElements(']', () => this.parseSpreadExpr());
        this.lexer.expect(']');
        return {
            type: types_1.SyntaxType.ARRAY_EXPR,
            elements,
        };
    }
    parseBlockExpr() {
        this.lexer.expect('(');
        const statements = this.parseStatements(')');
        this.lexer.expect(')');
        if (statements.length === 0) {
            throw new parser_1.JsonTemplateParserError('empty block is not allowed');
        }
        return {
            type: types_1.SyntaxType.BLOCK_EXPR,
            statements,
        };
    }
    parseAsyncFunctionExpr() {
        this.lexer.ignoreTokens(1);
        if (this.lexer.matchFunction()) {
            return this.parseFunctionExpr(true);
        }
        if (this.lexer.matchLambda()) {
            return this.parseLambdaExpr(true);
        }
        this.lexer.throwUnexpectedToken();
    }
    parseLambdaExpr(asyncFn = false) {
        this.lexer.ignoreTokens(1);
        const expr = this.parseBaseExpr();
        return {
            type: types_1.SyntaxType.FUNCTION_EXPR,
            body: (0, common_1.convertToStatementsExpr)(expr),
            params: ['...args'],
            async: asyncFn,
            lambda: true,
        };
    }
    parseCompileTimeBaseExpr() {
        this.lexer.expect('{');
        this.lexer.expect('{');
        const expr = this.parseBaseExpr();
        this.lexer.expect('}');
        this.lexer.expect('}');
        return expr;
    }
    parseCompileTimeExpr() {
        this.lexer.expect('{');
        this.lexer.expect('{');
        const skipJsonify = this.lexer.matchCompileTimeExpr();
        const expr = skipJsonify ? this.parseCompileTimeBaseExpr() : this.parseBaseExpr();
        this.lexer.expect('}');
        this.lexer.expect('}');
        const exprVal = engine_1.JsonTemplateEngine.createAsSync(expr).evaluate({}, this.options?.compileTimeBindings);
        const template = skipJsonify ? exprVal : JSON.stringify(exprVal);
        return JsonTemplateParser.parseBaseExprFromTemplate(template);
    }
    parseNumber() {
        let val = this.lexer.value();
        if (this.lexer.match('.')) {
            val += this.lexer.value();
            if (this.lexer.matchINT()) {
                val += this.lexer.value();
            }
            return {
                type: types_1.SyntaxType.LITERAL,
                value: parseFloat(val),
                tokenType: types_1.TokenType.FLOAT,
            };
        }
        return {
            type: types_1.SyntaxType.LITERAL,
            value: parseInt(val, 10),
            tokenType: types_1.TokenType.INT,
        };
    }
    parseFloatingNumber() {
        const val = this.lexer.value() + this.lexer.value();
        return {
            type: types_1.SyntaxType.LITERAL,
            value: parseFloat(val),
            tokenType: types_1.TokenType.FLOAT,
        };
    }
    parseReturnExpr() {
        this.lexer.ignoreTokens(1);
        let value;
        if (!this.lexer.match(';')) {
            value = this.parseBaseExpr();
        }
        return {
            type: types_1.SyntaxType.RETURN_EXPR,
            value,
        };
    }
    parseThrowExpr() {
        this.lexer.ignoreTokens(1);
        return {
            type: types_1.SyntaxType.THROW_EXPR,
            value: this.parseBaseExpr(),
        };
    }
    parseKeywordBasedExpr() {
        const token = this.lexer.lookahead();
        switch (token.value) {
            case types_1.Keyword.NEW:
                return this.parseFunctionCallExpr();
            case types_1.Keyword.LAMBDA:
                return this.parseLambdaExpr();
            case types_1.Keyword.ASYNC:
                return this.parseAsyncFunctionExpr();
            case types_1.Keyword.RETURN:
                return this.parseReturnExpr();
            case types_1.Keyword.THROW:
                return this.parseThrowExpr();
            case types_1.Keyword.FUNCTION:
                return this.parseFunctionExpr();
            case types_1.Keyword.FOR:
                return this.parseLoopExpr();
            case types_1.Keyword.CONTINUE:
            case types_1.Keyword.BREAK:
                return this.parseLoopControlExpr();
            default:
                return this.parseDefinitionExpr();
        }
    }
    static isValidMapping(mapping) {
        return (typeof mapping.key === 'string' &&
            mapping.value.type === types_1.SyntaxType.LITERAL &&
            mapping.value.tokenType === types_1.TokenType.STR);
    }
    static convertMappingsToFlatPaths(mappings) {
        const flatPaths = {};
        for (const mappingProp of mappings.props) {
            if (!JsonTemplateParser.isValidMapping(mappingProp)) {
                throw new parser_1.JsonTemplateParserError(`Invalid mapping key=${JSON.stringify(mappingProp.key)} or value=${JSON.stringify(mappingProp.value)}, expected string key and string value`);
            }
            flatPaths[mappingProp.key] = mappingProp.value.value;
        }
        if (!flatPaths.input || !flatPaths.output) {
            throw new parser_1.JsonTemplateParserError(`Invalid mapping: ${JSON.stringify(flatPaths)}, missing input or output`);
        }
        return flatPaths;
    }
    parseMappings() {
        this.lexer.expect('~m');
        const mappings = this.parseArrayExpr();
        const flatMappings = [];
        for (const mapping of mappings.elements) {
            if (mapping.type !== types_1.SyntaxType.OBJECT_EXPR) {
                throw new parser_1.JsonTemplateParserError(`Invalid mapping=${JSON.stringify(mapping)}, expected object`);
            }
            flatMappings.push(JsonTemplateParser.convertMappingsToFlatPaths(mapping));
        }
        return engine_1.JsonTemplateEngine.parseMappingPaths(flatMappings);
    }
    parsePrimaryExpr() {
        if (this.lexer.match(';')) {
            return constants_1.EMPTY_EXPR;
        }
        if (this.lexer.matchTokenType(types_1.TokenType.LAMBDA_ARG)) {
            return {
                type: types_1.SyntaxType.LAMBDA_ARG,
                index: this.lexer.value(),
            };
        }
        if (this.lexer.matchKeyword()) {
            return this.parseKeywordBasedExpr();
        }
        if (this.lexer.matchINT()) {
            return this.parseNumber();
        }
        if (this.lexer.match('???')) {
            return this.parseArrayCoalesceExpr();
        }
        if (this.lexer.match('.') && this.lexer.matchINT(1) && !this.lexer.match('.', 2)) {
            return this.parseFloatingNumber();
        }
        if (this.lexer.matchLiteral()) {
            return this.parseLiteralExpr();
        }
        if (this.lexer.matchCompileTimeExpr()) {
            return this.parseCompileTimeExpr();
        }
        if (this.lexer.match('{')) {
            return this.parseObjectExpr();
        }
        if (this.lexer.match('[')) {
            return this.parseArrayExpr();
        }
        if (this.lexer.matchPathType()) {
            return this.parsePathTypeExpr();
        }
        if (this.lexer.matchMappings()) {
            return this.parseMappings();
        }
        if (this.lexer.matchPath()) {
            return this.parsePath();
        }
        if (this.lexer.match('(')) {
            return this.parseBlockExpr();
        }
        return this.lexer.throwUnexpectedToken();
    }
    shouldPathBeConvertedAsBlock(parts) {
        return (!this.options?.mappings &&
            parts
                .filter((part, index) => part.type === types_1.SyntaxType.PATH_OPTIONS && index !== parts.length - 1)
                .some((part) => part.options?.index ?? part.options?.item));
    }
    static convertToBlockExpr(expr) {
        return {
            type: types_1.SyntaxType.FUNCTION_EXPR,
            block: true,
            body: (0, common_1.convertToStatementsExpr)(expr),
        };
    }
    static ignoreEmptySelectors(parts) {
        return parts.filter((part) => !(part.type === types_1.SyntaxType.SELECTOR && part.selector === '.' && !part.prop));
    }
    static combinePathOptionParts(parts) {
        if (parts.length < 2) {
            return parts;
        }
        const newParts = [];
        for (let i = 0; i < parts.length; i += 1) {
            const currPart = parts[i];
            if (i < parts.length - 1 && parts[i + 1].type === types_1.SyntaxType.PATH_OPTIONS) {
                currPart.options = parts[i + 1].options;
                i++;
            }
            newParts.push(currPart);
        }
        return newParts;
    }
    static convertToFunctionCallExpr(fnExpr, pathExpr) {
        const lastPart = (0, common_1.getLastElement)(pathExpr.parts);
        // Updated
        const newFnExpr = fnExpr;
        if (lastPart?.type === types_1.SyntaxType.SELECTOR) {
            const selectorExpr = lastPart;
            if (selectorExpr.selector === '.' && selectorExpr.prop?.type === types_1.TokenType.ID) {
                pathExpr.parts.pop();
                newFnExpr.id = selectorExpr.prop.value;
            }
        }
        if (!pathExpr.parts.length && pathExpr.root && typeof pathExpr.root !== 'object') {
            newFnExpr.parent = pathExpr.root;
        }
        else {
            newFnExpr.object = pathExpr;
        }
        return newFnExpr;
    }
    static isArrayFilterExpressionSimple(expr) {
        if (expr.filter.type !== types_1.SyntaxType.ARRAY_INDEX_FILTER_EXPR) {
            return false;
        }
        const filter = expr.filter;
        return filter.indexes.elements.length <= 1;
    }
    static isSimplePathPart(part) {
        if (part.type === types_1.SyntaxType.SELECTOR) {
            const expr = part;
            return expr.selector === '.' && !!expr.prop && expr.prop.type !== types_1.TokenType.PUNCT;
        }
        if (part.type === types_1.SyntaxType.ARRAY_FILTER_EXPR) {
            return this.isArrayFilterExpressionSimple(part);
        }
        return false;
    }
    static isSimplePath(pathExpr) {
        return pathExpr.parts.every((part) => this.isSimplePathPart(part));
    }
    static isRichPath(pathExpr) {
        if (!pathExpr.parts.length) {
            return false;
        }
        return !this.isSimplePath(pathExpr);
    }
    static setPathTypeIfNotJSON(pathExpr, pathType) {
        const newPathExpr = pathExpr;
        if (pathExpr.inferredPathType !== types_1.PathType.JSON) {
            newPathExpr.inferredPathType = pathType;
        }
        return newPathExpr;
    }
    updatePathExpr(pathExpr) {
        const newPathExpr = pathExpr;
        if (newPathExpr.parts.length > 1 && newPathExpr.parts[0].type === types_1.SyntaxType.PATH_OPTIONS) {
            newPathExpr.options = newPathExpr.parts[0].options;
            newPathExpr.parts.shift();
        }
        const shouldConvertAsBlock = this.shouldPathBeConvertedAsBlock(newPathExpr.parts);
        let lastPart = (0, common_1.getLastElement)(newPathExpr.parts);
        let fnExpr;
        if (lastPart?.type === types_1.SyntaxType.FUNCTION_CALL_EXPR) {
            fnExpr = newPathExpr.parts.pop();
        }
        lastPart = (0, common_1.getLastElement)(newPathExpr.parts);
        if (lastPart?.type === types_1.SyntaxType.PATH_OPTIONS && lastPart.options?.toArray) {
            newPathExpr.returnAsArray = lastPart.options?.toArray;
            if (!lastPart.options.item && !lastPart.options.index) {
                newPathExpr.parts.pop();
            }
            else {
                lastPart.options.toArray = false;
            }
        }
        newPathExpr.parts = JsonTemplateParser.combinePathOptionParts(newPathExpr.parts);
        let expr = newPathExpr;
        if (fnExpr) {
            expr = JsonTemplateParser.convertToFunctionCallExpr(fnExpr, newPathExpr);
        }
        if (shouldConvertAsBlock) {
            expr = JsonTemplateParser.convertToBlockExpr(expr);
            JsonTemplateParser.setPathTypeIfNotJSON(newPathExpr, types_1.PathType.RICH);
        }
        else if (JsonTemplateParser.isRichPath(newPathExpr)) {
            JsonTemplateParser.setPathTypeIfNotJSON(newPathExpr, types_1.PathType.RICH);
        }
        return expr;
    }
    static parseBaseExprFromTemplate(template) {
        const lexer = new lexer_2.JsonTemplateLexer(template);
        const parser = new JsonTemplateParser(lexer);
        return parser.parseBaseExpr();
    }
}
exports.JsonTemplateParser = JsonTemplateParser;
