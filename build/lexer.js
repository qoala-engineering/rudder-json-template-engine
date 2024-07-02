"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonTemplateLexer = void 0;
const constants_1 = require("./constants");
const lexer_1 = require("./errors/lexer");
const types_1 = require("./types");
const MESSAGES = {
    RESERVED_ID: 'Reserved ID pattern "%0"',
    UNEXP_TOKEN: 'Unexpected token "%0"',
    UNKNOWN_TOKEN: 'Unknown token',
    UNEXP_EOT: 'Unexpected end of template',
};
class JsonTemplateLexer {
    constructor(template) {
        this.idx = 0;
        this.buf = [];
        this.codeChars = template.split('');
    }
    init() {
        this.idx = 0;
        this.buf = [];
    }
    currentIndex() {
        return this.idx;
    }
    reset(idx) {
        this.idx = idx;
        this.buf = [];
    }
    getCode(start, end) {
        return this.codeChars.slice(start, end).join('');
    }
    match(value, steps = 0) {
        if (!value) {
            return false;
        }
        const token = this.lookahead(steps);
        return token.type === types_1.TokenType.PUNCT && token.value === value;
    }
    matchAssignment() {
        return (this.match('=') ||
            this.match('+=') ||
            this.match('-=') ||
            this.match('*=') ||
            this.match('/='));
    }
    matchLiteral() {
        return JsonTemplateLexer.isLiteralToken(this.lookahead());
    }
    matchINT(steps = 0) {
        return this.matchTokenType(types_1.TokenType.INT, steps);
    }
    matchToArray() {
        return this.match('[') && this.match(']', 1);
    }
    matchCompileTimeExpr() {
        return this.match('{') && this.match('{', 1);
    }
    matchMappings() {
        return this.match('~m');
    }
    matchSimplePath() {
        return this.match('~s');
    }
    matchRichPath() {
        return this.match('~r');
    }
    matchJsonPath() {
        return this.match('~j');
    }
    matchPathType() {
        return this.matchRichPath() || this.matchJsonPath() || this.matchSimplePath();
    }
    matchPath() {
        return this.matchPathSelector() || this.matchID();
    }
    matchObjectContextProp() {
        return this.match('@') && this.matchID(1);
    }
    matchSpread() {
        return this.match('...');
    }
    matchIncrement() {
        return this.match('++');
    }
    matchDecrement() {
        return this.match('--');
    }
    matchPathPartSelector() {
        const token = this.lookahead();
        if (token.type === types_1.TokenType.PUNCT) {
            return token.value === '.' || token.value === '..';
        }
        return false;
    }
    matchPathSelector() {
        const token = this.lookahead();
        if (token.type === types_1.TokenType.PUNCT) {
            const { value } = token;
            return value === '.' || value === '..' || value === '^' || value === '@';
        }
        return false;
    }
    matchTokenType(tokenType, steps = 0) {
        const token = this.lookahead(steps);
        return token.type === tokenType;
    }
    matchID(steps = 0) {
        return this.matchTokenType(types_1.TokenType.ID, steps);
    }
    matchEOT() {
        return this.matchTokenType(types_1.TokenType.EOT);
    }
    static isOperator(id) {
        return Object.values(types_1.Keyword).some((op) => op.toString() === id);
    }
    matchKeyword() {
        return this.matchTokenType(types_1.TokenType.KEYWORD);
    }
    matchKeywordValue(val) {
        const token = this.lookahead();
        return token.type === types_1.TokenType.KEYWORD && token.value === val;
    }
    matchContains() {
        return this.matchKeywordValue(types_1.Keyword.CONTAINS);
    }
    matchEmpty() {
        return this.matchKeywordValue(types_1.Keyword.EMPTY);
    }
    matchSize() {
        return this.matchKeywordValue(types_1.Keyword.SIZE);
    }
    matchSubsetOf() {
        return this.matchKeywordValue(types_1.Keyword.SUBSETOF);
    }
    matchAnyOf() {
        return this.matchKeywordValue(types_1.Keyword.ANYOF);
    }
    matchNoneOf() {
        return this.matchKeywordValue(types_1.Keyword.NONEOF);
    }
    matchIN() {
        return this.matchKeywordValue(types_1.Keyword.IN);
    }
    matchNotIN() {
        return this.matchKeywordValue(types_1.Keyword.NOT_IN);
    }
    matchFunction() {
        return this.matchKeywordValue(types_1.Keyword.FUNCTION);
    }
    matchNew() {
        return this.matchKeywordValue(types_1.Keyword.NEW);
    }
    matchTypeOf() {
        return this.matchKeywordValue(types_1.Keyword.TYPEOF);
    }
    matchAwait() {
        return this.matchKeywordValue(types_1.Keyword.AWAIT);
    }
    matchLambda() {
        return this.matchKeywordValue(types_1.Keyword.LAMBDA);
    }
    expect(value) {
        const token = this.lex();
        if (token.type !== types_1.TokenType.PUNCT || token.value !== value) {
            this.throwUnexpectedToken(token);
        }
    }
    lookahead(steps = 0) {
        if (this.buf[steps] !== undefined) {
            return this.buf[steps];
        }
        const pos = this.idx;
        if (this.buf.length) {
            // eslint-disable-next-line prefer-destructuring
            this.idx = this.buf[this.buf.length - 1].range[1];
        }
        for (let i = this.buf.length; i <= steps; i += 1) {
            this.buf.push(this.advance());
        }
        this.idx = pos;
        return this.buf[steps];
    }
    isLineCommentStart() {
        return this.codeChars[this.idx] === '/' && this.codeChars[this.idx + 1] === '/';
    }
    isLineCommentEnd() {
        return this.idx >= this.codeChars.length || this.codeChars[this.idx] === '\n';
    }
    isBlockCommentStart() {
        return this.codeChars[this.idx] === '/' && this.codeChars[this.idx + 1] === '*';
    }
    isBlockCommentEnd() {
        return this.codeChars[this.idx] === '*' && this.codeChars[this.idx + 1] === '/';
    }
    skipLineComment() {
        if (!this.isLineCommentStart()) {
            return;
        }
        while (!this.isLineCommentEnd()) {
            ++this.idx;
        }
        ++this.idx;
    }
    skipBlockComment() {
        if (!this.isBlockCommentStart()) {
            return;
        }
        while (!this.isBlockCommentEnd()) {
            ++this.idx;
        }
        this.idx += 2;
    }
    isWhiteSpace() {
        return ' \r\n\t'.includes(this.codeChars[this.idx]);
    }
    skipWhitespace() {
        while (this.isWhiteSpace()) {
            ++this.idx;
        }
    }
    skipInput() {
        while (this.isWhiteSpace() || this.isBlockCommentStart() || this.isLineCommentStart()) {
            this.skipWhitespace();
            this.skipLineComment();
            this.skipBlockComment();
        }
    }
    advance() {
        this.skipInput();
        if (this.idx >= this.codeChars.length) {
            return {
                type: types_1.TokenType.EOT,
                range: [this.idx, this.idx],
                value: undefined,
            };
        }
        const token = this.scanRegularExpressions() ??
            this.scanPunctuator() ??
            this.scanID() ??
            this.scanString() ??
            this.scanInteger();
        if (token) {
            return token;
        }
        JsonTemplateLexer.throwError(MESSAGES.UNKNOWN_TOKEN);
    }
    value() {
        return this.lex().value;
    }
    ignoreTokens(numTokens) {
        for (let i = 0; i < numTokens; i++) {
            this.lex();
        }
    }
    lex() {
        if (this.buf[0]) {
            // eslint-disable-next-line prefer-destructuring
            this.idx = this.buf[0].range[1];
            const token = this.buf[0];
            this.buf = this.buf.slice(1);
            return token;
        }
        return this.advance();
    }
    static isLiteralToken(token) {
        return (token.type === types_1.TokenType.BOOL ||
            token.type === types_1.TokenType.INT ||
            token.type === types_1.TokenType.FLOAT ||
            token.type === types_1.TokenType.STR ||
            token.type === types_1.TokenType.NULL ||
            token.type === types_1.TokenType.UNDEFINED ||
            token.type === types_1.TokenType.REGEXP);
    }
    throwUnexpectedToken(token) {
        const newToken = token ?? this.lookahead();
        if (newToken.type === types_1.TokenType.EOT) {
            JsonTemplateLexer.throwError(MESSAGES.UNEXP_EOT);
        }
        JsonTemplateLexer.throwError(MESSAGES.UNEXP_TOKEN, newToken.value);
    }
    static throwError(messageFormat, ...args) {
        const msg = messageFormat.replace(/%(\d)/g, (_, idx) => args[idx]);
        throw new lexer_1.JsonTemplateLexerError(msg);
    }
    static isDigit(ch) {
        return '0123456789'.indexOf(ch) >= 0;
    }
    static isIdStart(ch) {
        return ch === '_' || ch === '$' || (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
    }
    static isIdPart(ch) {
        return this.isIdStart(ch) || (ch >= '0' && ch <= '9');
    }
    static validateID(id) {
        if (id.startsWith(constants_1.VARS_PREFIX)) {
            JsonTemplateLexer.throwError(MESSAGES.RESERVED_ID, id);
        }
    }
    scanID() {
        let ch = this.codeChars[this.idx];
        if (!JsonTemplateLexer.isIdStart(ch)) {
            return;
        }
        const start = this.idx;
        let id = ch;
        while (++this.idx < this.codeChars.length) {
            ch = this.codeChars[this.idx];
            if (!JsonTemplateLexer.isIdPart(ch)) {
                break;
            }
            id += ch;
        }
        if (JsonTemplateLexer.isOperator(id)) {
            return {
                type: types_1.TokenType.KEYWORD,
                value: id,
                range: [start, this.idx],
            };
        }
        switch (id) {
            case 'true':
            case 'false':
                return {
                    type: types_1.TokenType.BOOL,
                    value: id === 'true',
                    range: [start, this.idx],
                };
            case 'null':
                return {
                    type: types_1.TokenType.NULL,
                    value: null,
                    range: [start, this.idx],
                };
            case 'undefined':
                return {
                    type: types_1.TokenType.UNDEFINED,
                    value: undefined,
                    range: [start, this.idx],
                };
            default:
                JsonTemplateLexer.validateID(id);
                return {
                    type: types_1.TokenType.ID,
                    value: id,
                    range: [start, this.idx],
                };
        }
    }
    scanString() {
        if (this.codeChars[this.idx] !== '"' &&
            this.codeChars[this.idx] !== '`' &&
            this.codeChars[this.idx] !== "'") {
            return;
        }
        const orig = this.codeChars[this.idx];
        const start = ++this.idx;
        let str = '';
        let eosFound = false;
        let ch;
        while (this.idx < this.codeChars.length) {
            ch = this.codeChars[this.idx++];
            if (ch === '\\') {
                ch = this.codeChars[this.idx++];
            }
            else if ('\'"`'.includes(ch) && ch === orig) {
                eosFound = true;
                break;
            }
            str += ch;
        }
        if (eosFound) {
            return {
                type: types_1.TokenType.STR,
                value: str,
                range: [start, this.idx],
            };
        }
        this.throwUnexpectedToken();
    }
    scanInteger() {
        const start = this.idx;
        let ch = this.codeChars[this.idx];
        if (!JsonTemplateLexer.isDigit(ch)) {
            return;
        }
        let num = ch;
        while (++this.idx < this.codeChars.length) {
            ch = this.codeChars[this.idx];
            if (!JsonTemplateLexer.isDigit(ch)) {
                break;
            }
            num += ch;
        }
        return {
            type: types_1.TokenType.INT,
            value: num,
            range: [start, this.idx],
        };
    }
    scanPunctuatorForDots() {
        const start = this.idx;
        const ch1 = this.codeChars[this.idx];
        const ch2 = this.codeChars[this.idx + 1];
        const ch3 = this.codeChars[this.idx + 2];
        if (ch1 !== '.') {
            return;
        }
        if (ch2 === '(' && ch3 === ')') {
            this.idx += 3;
            return {
                type: types_1.TokenType.PUNCT,
                value: '.()',
                range: [start, this.idx],
            };
        }
        if (ch2 === '.' && ch3 === '.') {
            this.idx += 3;
            return {
                type: types_1.TokenType.PUNCT,
                value: '...',
                range: [start, this.idx],
            };
        }
        if (ch2 === '.') {
            this.idx += 2;
            return {
                type: types_1.TokenType.PUNCT,
                value: '..',
                range: [start, this.idx],
            };
        }
        return {
            type: types_1.TokenType.PUNCT,
            value: '.',
            range: [start, ++this.idx],
        };
    }
    scanPunctuatorForEquality() {
        const start = this.idx;
        const ch1 = this.codeChars[this.idx];
        const ch2 = this.codeChars[this.idx + 1];
        const ch3 = this.codeChars[this.idx + 2];
        if (ch2 === '=') {
            if (ch3 === '=') {
                if ('=!^$*'.indexOf(ch1) >= 0) {
                    this.idx += 3;
                    return {
                        type: types_1.TokenType.PUNCT,
                        value: ch1 + ch2 + ch3,
                        range: [start, this.idx],
                    };
                }
            }
            else if ('^$*'.indexOf(ch3) >= 0) {
                if (ch1 === '=') {
                    this.idx += 3;
                    return {
                        type: types_1.TokenType.PUNCT,
                        value: ch1 + ch2 + ch3,
                        range: [start, this.idx],
                    };
                }
            }
            else if ('=!^$><'.indexOf(ch1) >= 0) {
                this.idx += 2;
                return {
                    type: types_1.TokenType.PUNCT,
                    value: ch1 + ch2,
                    range: [start, this.idx],
                };
            }
        }
        else if (ch1 === '=') {
            if ('^$*~'.indexOf(ch2) >= 0) {
                this.idx += 2;
                return {
                    type: types_1.TokenType.PUNCT,
                    value: ch1 + ch2,
                    range: [start, this.idx],
                };
            }
            return {
                type: types_1.TokenType.PUNCT,
                value: ch1,
                range: [start, ++this.idx],
            };
        }
    }
    scanPunctuatorForRepeatedTokens(validSymbols, numRepeations = 2) {
        const start = this.idx;
        const ch = this.codeChars[this.idx];
        let tokenVal = ch;
        for (let i = 1; i < numRepeations; i++) {
            if (this.codeChars[this.idx + i] !== ch) {
                return;
            }
            tokenVal += ch;
        }
        if (validSymbols.includes(ch)) {
            this.idx += numRepeations;
            return {
                type: types_1.TokenType.PUNCT,
                value: tokenVal,
                range: [start, this.idx],
            };
        }
    }
    scanSingleCharPunctuators() {
        const start = this.idx;
        const ch1 = this.codeChars[this.idx];
        if (',;:{}()[]^+-*/%!><|=@~#?\n'.includes(ch1)) {
            return {
                type: types_1.TokenType.PUNCT,
                value: ch1,
                range: [start, ++this.idx],
            };
        }
    }
    scanPunctuatorForQuestionMarks() {
        const start = this.idx;
        const ch1 = this.codeChars[this.idx];
        const ch2 = this.codeChars[this.idx + 1];
        if (ch1 === '?' && JsonTemplateLexer.isDigit(ch2)) {
            this.idx += 2;
            return {
                type: types_1.TokenType.LAMBDA_ARG,
                value: Number(ch2),
                range: [start, this.idx],
            };
        }
    }
    scanPunctuatorForPaths() {
        const start = this.idx;
        const ch1 = this.codeChars[this.idx];
        const ch2 = this.codeChars[this.idx + 1];
        if (ch1 === '~' && 'rsjm'.includes(ch2)) {
            this.idx += 2;
            return {
                type: types_1.TokenType.PUNCT,
                value: ch1 + ch2,
                range: [start, this.idx],
            };
        }
    }
    scanPunctuatorForArithmeticAssignment() {
        const start = this.idx;
        const ch1 = this.codeChars[this.idx];
        const ch2 = this.codeChars[this.idx + 1];
        if ('+-/*'.includes(ch1) && ch2 === '=') {
            this.idx += 2;
            return {
                type: types_1.TokenType.PUNCT,
                value: ch1 + ch2,
                range: [start, this.idx],
            };
        }
    }
    static isValidRegExp(regexp, modifiers) {
        try {
            RegExp(regexp, modifiers);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    getRegExpModifiers() {
        let modifiers = '';
        while ('gimsuyv'.includes(this.codeChars[this.idx])) {
            modifiers += this.codeChars[this.idx];
            this.idx++;
        }
        return modifiers;
    }
    scanRegularExpressions() {
        const start = this.idx;
        const ch1 = this.codeChars[this.idx];
        if (ch1 === '/') {
            let end = this.idx + 1;
            while (end < this.codeChars.length) {
                if (this.codeChars[end] === '\n') {
                    return;
                }
                if (this.codeChars[end] === '/') {
                    break;
                }
                end++;
            }
            if (end < this.codeChars.length) {
                this.idx = end + 1;
                const regexp = this.getCode(start + 1, end);
                const modifiers = this.getRegExpModifiers();
                if (!JsonTemplateLexer.isValidRegExp(regexp, modifiers)) {
                    JsonTemplateLexer.throwError("invalid regular expression '%0'", regexp);
                }
                return {
                    type: types_1.TokenType.REGEXP,
                    value: this.getCode(start, this.idx),
                    range: [start, this.idx],
                };
            }
        }
    }
    scanPunctuator() {
        return (this.scanPunctuatorForDots() ??
            this.scanPunctuatorForQuestionMarks() ??
            this.scanPunctuatorForArithmeticAssignment() ??
            this.scanPunctuatorForEquality() ??
            this.scanPunctuatorForPaths() ??
            this.scanPunctuatorForRepeatedTokens('?', 3) ??
            this.scanPunctuatorForRepeatedTokens('|&*.=>?<+-', 2) ??
            this.scanSingleCharPunctuators());
    }
}
exports.JsonTemplateLexer = JsonTemplateLexer;
