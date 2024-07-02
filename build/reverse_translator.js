"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonTemplateReverseTranslator = void 0;
const types_1 = require("./types");
const translator_1 = require("./utils/translator");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class JsonTemplateReverseTranslator {
    constructor(options) {
        this.level = 0;
        this.options = options;
    }
    translate(expr) {
        let code = this.translateExpression(expr);
        code = code.replace(/\.\s+\./g, '.');
        if (this.options?.defaultPathType === types_1.PathType.JSON) {
            code = code.replace(/\^/g, '$');
        }
        return code;
    }
    translateExpression(expr) {
        switch (expr.type) {
            case types_1.SyntaxType.LITERAL:
                return this.translateLiteralExpression(expr);
            case types_1.SyntaxType.STATEMENTS_EXPR:
                return this.translateStatementsExpression(expr);
            case types_1.SyntaxType.MATH_EXPR:
            case types_1.SyntaxType.COMPARISON_EXPR:
            case types_1.SyntaxType.IN_EXPR:
            case types_1.SyntaxType.LOGICAL_AND_EXPR:
            case types_1.SyntaxType.LOGICAL_OR_EXPR:
            case types_1.SyntaxType.LOGICAL_COALESCE_EXPR:
                return this.translateBinaryExpression(expr);
            case types_1.SyntaxType.ARRAY_EXPR:
                return this.translateArrayExpression(expr);
            case types_1.SyntaxType.OBJECT_EXPR:
                return this.translateObjectExpression(expr);
            case types_1.SyntaxType.SPREAD_EXPR:
                return this.translateSpreadExpression(expr);
            case types_1.SyntaxType.BLOCK_EXPR:
                return this.translateBlockExpression(expr);
            case types_1.SyntaxType.UNARY_EXPR:
                return this.translateUnaryExpression(expr);
            case types_1.SyntaxType.INCREMENT:
                return this.translateIncrementExpression(expr);
            case types_1.SyntaxType.PATH:
                return this.translatePathExpression(expr);
            case types_1.SyntaxType.CONDITIONAL_EXPR:
                return this.translateConditionalExpression(expr);
            case types_1.SyntaxType.DEFINITION_EXPR:
                return this.translateDefinitionExpression(expr);
            case types_1.SyntaxType.ASSIGNMENT_EXPR:
                return this.translateAssignmentExpression(expr);
            case types_1.SyntaxType.FUNCTION_CALL_EXPR:
                return this.translateFunctionCallExpression(expr);
            case types_1.SyntaxType.FUNCTION_EXPR:
                return this.translateFunctionExpression(expr);
            case types_1.SyntaxType.THROW_EXPR:
                return this.translateThrowExpression(expr);
            case types_1.SyntaxType.RETURN_EXPR:
                return this.translateReturnExpression(expr);
            case types_1.SyntaxType.LOOP_EXPR:
                return this.translateLoopExpression(expr);
            case types_1.SyntaxType.LOOP_CONTROL_EXPR:
                return this.translateLoopControlExpression(expr);
            case types_1.SyntaxType.LAMBDA_ARG:
                return this.translateLambdaArgExpression(expr);
            case types_1.SyntaxType.OBJECT_FILTER_EXPR:
                return this.translateObjectFilterExpression(expr);
            case types_1.SyntaxType.SELECTOR:
                return this.translateSelectorExpression(expr);
            case types_1.SyntaxType.OBJECT_PROP_EXPR:
                return this.translateObjectPropExpression(expr);
            case types_1.SyntaxType.OBJECT_INDEX_FILTER_EXPR:
                return this.translateObjectIndexFilterExpression(expr);
            case types_1.SyntaxType.ARRAY_FILTER_EXPR:
                return this.translateArrayFilterExpression(expr);
            case types_1.SyntaxType.ARRAY_INDEX_FILTER_EXPR:
                return this.translateArrayIndexFilterExpression(expr);
            case types_1.SyntaxType.RANGE_FILTER_EXPR:
                return this.translateRangeFilterExpression(expr);
            default:
                return '';
        }
    }
    translateArrayFilterExpression(expr) {
        return this.translateExpression(expr.filter);
    }
    translateRangeFilterExpression(expr) {
        const code = [];
        code.push('[');
        if (expr.fromIdx) {
            code.push(this.translateExpression(expr.fromIdx));
        }
        code.push(':');
        if (expr.toIdx) {
            code.push(this.translateExpression(expr.toIdx));
        }
        code.push(']');
        return code.join('');
    }
    translateArrayIndexFilterExpression(expr) {
        return this.translateExpression(expr.indexes);
    }
    translateObjectIndexFilterExpression(expr) {
        const code = [];
        code.push('{');
        if (expr.exclude) {
            code.push('!');
        }
        code.push(this.translateExpression(expr.indexes));
        code.push('}');
        return code.join('');
    }
    translateSelectorExpression(expr) {
        const code = [];
        code.push(expr.selector);
        if (expr.prop) {
            if (expr.prop.type === types_1.TokenType.STR) {
                code.push((0, utils_1.escapeStr)(expr.prop.value));
            }
            else {
                code.push(expr.prop.value);
            }
        }
        return code.join('');
    }
    translateWithWrapper(expr, prefix, suffix) {
        return `${prefix}${this.translateExpression(expr)}${suffix}`;
    }
    translateObjectFilterExpression(expr) {
        if (expr.filter.type === types_1.SyntaxType.ALL_FILTER_EXPR) {
            return '[*]';
        }
        if (this.options?.defaultPathType === types_1.PathType.JSON) {
            return this.translateWithWrapper(expr.filter, '[?(', ')]');
        }
        return this.translateWithWrapper(expr.filter, '{', '}');
    }
    translateLambdaArgExpression(expr) {
        return `?${expr.index}`;
    }
    translateLoopControlExpression(expr) {
        return expr.control;
    }
    translateLoopExpression(expr) {
        const code = [];
        code.push('for');
        code.push('(');
        if (expr.init) {
            code.push(this.translateExpression(expr.init));
        }
        code.push(';');
        if (expr.test) {
            code.push(this.translateExpression(expr.test));
        }
        code.push(';');
        if (expr.update) {
            code.push(this.translateExpression(expr.update));
        }
        code.push(')');
        code.push('{');
        code.push(this.translateExpression(expr.body));
        code.push('}');
        return code.join(' ');
    }
    translateReturnExpression(expr) {
        return `return ${this.translateExpression(expr.value || constants_1.EMPTY_EXPR)};`;
    }
    translateThrowExpression(expr) {
        return `throw ${this.translateExpression(expr.value)}`;
    }
    translateExpressions(exprs, sep, prefix = '') {
        return exprs.map((expr) => `${prefix}${this.translateExpression(expr)}`).join(sep);
    }
    translateLambdaFunctionExpression(expr) {
        return `lambda ${this.translateExpression(expr.body)}`;
    }
    translateRegularFunctionExpression(expr) {
        const code = [];
        code.push('function');
        code.push('(');
        if (expr.params && expr.params.length > 0) {
            code.push(expr.params.join(', '));
        }
        code.push(')');
        code.push('{');
        code.push(this.translateExpression(expr.body));
        code.push('}');
        return code.join(' ');
    }
    translateFunctionExpression(expr) {
        if (expr.block) {
            return this.translateExpression(expr.body.statements[0]);
        }
        const code = [];
        if (expr.async) {
            code.push('async');
        }
        if (expr.lambda) {
            code.push(this.translateLambdaFunctionExpression(expr));
        }
        else {
            code.push(this.translateRegularFunctionExpression(expr));
        }
        return code.join(' ');
    }
    translateFunctionCallExpression(expr) {
        const code = [];
        if (expr.object) {
            code.push(this.translateExpression(expr.object));
            if (expr.id) {
                code.push(`.${expr.id}`);
            }
        }
        else if (expr.parent) {
            code.push(this.translatePathRootString(expr.parent, types_1.PathType.SIMPLE));
            if (expr.id) {
                code.push(`.${expr.id}`);
            }
        }
        else if (expr.id) {
            code.push(expr.id.replace(constants_1.BINDINGS_PARAM_KEY, '$'));
        }
        code.push('(');
        if (expr.args) {
            code.push(this.translateExpressions(expr.args, ', '));
        }
        code.push(')');
        return code.join('');
    }
    translateAssignmentExpression(expr) {
        const code = [];
        code.push(this.translatePathExpression(expr.path));
        code.push(expr.op);
        code.push(this.translateExpression(expr.value));
        return code.join(' ');
    }
    translateDefinitionExpression(expr) {
        const code = [];
        code.push(expr.definition);
        if (expr.fromObject) {
            code.push('{ ');
        }
        code.push(expr.vars.join(', '));
        if (expr.fromObject) {
            code.push(' }');
        }
        code.push(' = ');
        code.push(this.translateExpression(expr.value));
        return code.join(' ');
    }
    translateConditionalExpressionBody(expr) {
        if (expr.type === types_1.SyntaxType.STATEMENTS_EXPR) {
            return this.translateWithWrapper(expr, '{', '}');
        }
        return this.translateExpression(expr);
    }
    translateConditionalExpression(expr) {
        const code = [];
        code.push(this.translateExpression(expr.if));
        code.push(' ? ');
        code.push(this.translateConditionalExpressionBody(expr.then));
        if (expr.else) {
            code.push(' : ');
            code.push(this.translateConditionalExpressionBody(expr.else));
        }
        return code.join('');
    }
    translatePathType(pathType) {
        switch (pathType) {
            case types_1.PathType.JSON:
                return '~j ';
            case types_1.PathType.RICH:
                return '~r ';
            case types_1.PathType.SIMPLE:
                return '~s ';
            default:
                return '';
        }
    }
    translatePathRootString(root, pathType) {
        if (root === constants_1.BINDINGS_PARAM_KEY) {
            return '$';
        }
        if (root === constants_1.DATA_PARAM_KEY) {
            return pathType === types_1.PathType.JSON ? '$' : '^';
        }
        return root;
    }
    translatePathRoot(expr, pathType) {
        if (typeof expr.root === 'string') {
            return this.translatePathRootString(expr.root, pathType);
        }
        if (expr.root) {
            const code = [];
            code.push(this.translateExpression(expr.root));
            if (expr.root.type === types_1.SyntaxType.PATH) {
                code.push('.(). ');
            }
            return code.join('');
        }
        return pathType === types_1.PathType.JSON ? '@. ' : '. ';
    }
    translatePathOptions(options) {
        if (!options) {
            return '';
        }
        const code = [];
        if (options.item) {
            code.push('@');
            code.push(options.item);
        }
        if (options.index) {
            code.push('#');
            code.push(options.index);
        }
        if (options.toArray) {
            code.push('[]');
        }
        return code.join('');
    }
    translatePathParts(parts) {
        const code = [];
        if (parts.length > 0 &&
            parts[0].type !== types_1.SyntaxType.SELECTOR &&
            parts[0].type !== types_1.SyntaxType.BLOCK_EXPR) {
            code.push('.');
        }
        for (const part of parts) {
            if (part.type === types_1.SyntaxType.BLOCK_EXPR) {
                code.push('.');
            }
            code.push(this.translateExpression(part));
            code.push(this.translatePathOptions(part.options));
        }
        return code.join('');
    }
    translatePathExpression(expr) {
        const code = [];
        code.push(this.translatePathType(expr.pathType));
        code.push(this.translatePathRoot(expr, expr.inferredPathType));
        code.push(this.translatePathOptions(expr.options));
        code.push(this.translatePathParts(expr.parts));
        if (expr.returnAsArray) {
            code.push('[]');
        }
        return code.join('');
    }
    translateIncrementExpression(expr) {
        if (expr.postfix) {
            return `${expr.id}${expr.op}`;
        }
        return `${expr.op}${expr.id}`;
    }
    translateUnaryExpression(expr) {
        return `${expr.op} ${this.translateExpression(expr.arg)}`;
    }
    translateBlockExpression(expr) {
        const code = [];
        code.push('(');
        code.push(this.translateExpressions(expr.statements, ';'));
        code.push(')');
        return code.join('');
    }
    translateSpreadExpression(expr) {
        return `...${this.translateExpression(expr.value)}`;
    }
    getIndentation() {
        return ' '.repeat(this.level * constants_1.INDENTATION_SPACES);
    }
    translateObjectExpression(expr) {
        const code = [];
        code.push('{');
        this.level++;
        code.push(this.translateExpressions(expr.props, ',', `\n${this.getIndentation()}`));
        this.level--;
        code.push(`\n${this.getIndentation()}}`);
        return code.join('');
    }
    translateObjectPropExpression(expr) {
        const code = [];
        if (expr.contextVar) {
            code.push(`@${expr.contextVar} `);
        }
        if (expr.key) {
            if (typeof expr.key === 'string') {
                code.push((0, utils_1.escapeStr)(expr.key));
            }
            else {
                code.push(this.translateWithWrapper(expr.key, '[', ']'));
            }
            code.push(': ');
        }
        code.push(this.translateExpression(expr.value));
        return code.join('');
    }
    translateArrayExpression(expr) {
        const code = [];
        code.push('[');
        code.push(this.translateExpressions(expr.elements, ', '));
        code.push(']');
        return code.join('');
    }
    translateLiteralExpression(expr) {
        return (0, translator_1.translateLiteral)(expr.tokenType, expr.value);
    }
    translateStatementsExpression(expr) {
        return this.translateExpressions(expr.statements, ';\n');
    }
    translateBinaryExpression(expr) {
        const left = this.translateExpression(expr.args[0]);
        const right = this.translateExpression(expr.args[1]);
        return `${left} ${expr.op} ${right}`;
    }
}
exports.JsonTemplateReverseTranslator = JsonTemplateReverseTranslator;
