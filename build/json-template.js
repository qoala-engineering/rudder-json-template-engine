var f = /* @__PURE__ */ ((i) => (i.FUNCTION = "function", i.NEW = "new", i.TYPEOF = "typeof", i.LET = "let", i.CONST = "const", i.LAMBDA = "lambda", i.AWAIT = "await", i.ASYNC = "async", i.IN = "in", i.NOT_IN = "nin", i.NOT = "not", i.CONTAINS = "contains", i.SUBSETOF = "subsetof", i.ANYOF = "anyof", i.NONEOF = "noneof", i.EMPTY = "empty", i.SIZE = "size", i.RETURN = "return", i.THROW = "throw", i.CONTINUE = "continue", i.BREAK = "break", i.FOR = "for", i))(f || {}), p = /* @__PURE__ */ ((i) => (i.UNKNOWN = "unknown", i.ID = "id", i.INT = "int", i.FLOAT = "float", i.STR = "str", i.BOOL = "bool", i.NULL = "null", i.UNDEFINED = "undefined", i.LAMBDA_ARG = "lambda_arg", i.PUNCT = "punct", i.THROW = "throw", i.KEYWORD = "keyword", i.EOT = "eot", i.REGEXP = "regexp", i))(p || {}), l = /* @__PURE__ */ ((i) => (i.BASE = "base", i.CONDITIONAL = "conditional", i.ASSIGNMENT = "assignment", i.COALESCING = "coalescing", i.OR = "or", i.AND = "and", i.EQUALITY = "equality", i.RELATIONAL = "relational", i.SHIFT = "shift", i.ADDITION = "addition", i.MULTIPLICATION = "multiplication", i.POWER = "power", i.UNARY = "unary", i.PREFIX_INCREMENT = "prefix_increment", i.POSTFIX_INCREMENT = "postfix_increment", i))(l || {}), n = /* @__PURE__ */ ((i) => (i.EMPTY = "empty", i.PATH = "path", i.PATH_OPTIONS = "path_options", i.SELECTOR = "selector", i.LAMBDA_ARG = "lambda_arg", i.INCREMENT = "increment", i.LITERAL = "literal", i.LOGICAL_COALESCE_EXPR = "logical_coalesce_expr", i.LOGICAL_OR_EXPR = "logical_or_expr", i.LOGICAL_AND_EXPR = "logical_and_expr", i.COMPARISON_EXPR = "comparison_expr", i.IN_EXPR = "in_expr", i.MATH_EXPR = "math_expr", i.UNARY_EXPR = "unary_expr", i.SPREAD_EXPR = "spread_expr", i.CONDITIONAL_EXPR = "conditional_expr", i.ARRAY_INDEX_FILTER_EXPR = "array_index_filter_expr", i.ALL_FILTER_EXPR = "all_filter_expr", i.OBJECT_INDEX_FILTER_EXPR = "object_index_filter_expr", i.RANGE_FILTER_EXPR = "range_filter_expr", i.OBJECT_FILTER_EXPR = "object_filter_expr", i.ARRAY_FILTER_EXPR = "array_filter_expr", i.DEFINITION_EXPR = "definition_expr", i.ASSIGNMENT_EXPR = "assignment_expr", i.OBJECT_PROP_EXPR = "object_prop_expr", i.OBJECT_EXPR = "object_expr", i.ARRAY_EXPR = "array_expr", i.BLOCK_EXPR = "block_expr", i.FUNCTION_EXPR = "function_expr", i.FUNCTION_CALL_EXPR = "function_call_expr", i.RETURN_EXPR = "return_expr", i.THROW_EXPR = "throw_expr", i.STATEMENTS_EXPR = "statements_expr", i.LOOP_CONTROL_EXPR = "loop_control_expr", i.LOOP_EXPR = "loop_expr", i))(n || {}), d = /* @__PURE__ */ ((i) => (i.SIMPLE = "simple", i.RICH = "rich", i.JSON = "json", i.UNKNOWN = "unknown", i))(d || {});
const A = "___", I = "___d", O = "___b", J = "___b.context.", tt = "___r", et = "___f", rt = 4, X = { type: n.EMPTY };
class $ extends Error {
  constructor(t, e, r) {
    super(`${t}. Input: ${e}, Output: ${r}`), this.inputMapping = e, this.outputMapping = r;
  }
}
class M extends Error {
}
const L = {
  RESERVED_ID: 'Reserved ID pattern "%0"',
  UNEXP_TOKEN: 'Unexpected token "%0"',
  UNKNOWN_TOKEN: "Unknown token",
  UNEXP_EOT: "Unexpected end of template"
};
class y {
  constructor(t) {
    this.idx = 0, this.buf = [], this.codeChars = t.split("");
  }
  init() {
    this.idx = 0, this.buf = [];
  }
  currentIndex() {
    return this.idx;
  }
  reset(t) {
    this.idx = t, this.buf = [];
  }
  getCode(t, e) {
    return this.codeChars.slice(t, e).join("");
  }
  match(t, e = 0) {
    if (!t)
      return !1;
    const r = this.lookahead(e);
    return r.type === p.PUNCT && r.value === t;
  }
  matchAssignment() {
    return this.match("=") || this.match("+=") || this.match("-=") || this.match("*=") || this.match("/=");
  }
  matchLiteral() {
    return y.isLiteralToken(this.lookahead());
  }
  matchINT(t = 0) {
    return this.matchTokenType(p.INT, t);
  }
  matchToArray() {
    return this.match("[") && this.match("]", 1);
  }
  matchCompileTimeExpr() {
    return this.match("{") && this.match("{", 1);
  }
  matchMappings() {
    return this.match("~m");
  }
  matchSimplePath() {
    return this.match("~s");
  }
  matchRichPath() {
    return this.match("~r");
  }
  matchJsonPath() {
    return this.match("~j");
  }
  matchPathType() {
    return this.matchRichPath() || this.matchJsonPath() || this.matchSimplePath();
  }
  matchPath() {
    return this.matchPathSelector() || this.matchID();
  }
  matchObjectContextProp() {
    return this.match("@") && this.matchID(1);
  }
  matchSpread() {
    return this.match("...");
  }
  matchIncrement() {
    return this.match("++");
  }
  matchDecrement() {
    return this.match("--");
  }
  matchPathPartSelector() {
    const t = this.lookahead();
    return t.type === p.PUNCT ? t.value === "." || t.value === ".." : !1;
  }
  matchPathSelector() {
    const t = this.lookahead();
    if (t.type === p.PUNCT) {
      const { value: e } = t;
      return e === "." || e === ".." || e === "^" || e === "@";
    }
    return !1;
  }
  matchTokenType(t, e = 0) {
    return this.lookahead(e).type === t;
  }
  matchID(t = 0) {
    return this.matchTokenType(p.ID, t);
  }
  matchEOT() {
    return this.matchTokenType(p.EOT);
  }
  static isOperator(t) {
    return Object.values(f).some((e) => e.toString() === t);
  }
  matchKeyword() {
    return this.matchTokenType(p.KEYWORD);
  }
  matchKeywordValue(t) {
    const e = this.lookahead();
    return e.type === p.KEYWORD && e.value === t;
  }
  matchContains() {
    return this.matchKeywordValue(f.CONTAINS);
  }
  matchEmpty() {
    return this.matchKeywordValue(f.EMPTY);
  }
  matchSize() {
    return this.matchKeywordValue(f.SIZE);
  }
  matchSubsetOf() {
    return this.matchKeywordValue(f.SUBSETOF);
  }
  matchAnyOf() {
    return this.matchKeywordValue(f.ANYOF);
  }
  matchNoneOf() {
    return this.matchKeywordValue(f.NONEOF);
  }
  matchIN() {
    return this.matchKeywordValue(f.IN);
  }
  matchNotIN() {
    return this.matchKeywordValue(f.NOT_IN);
  }
  matchFunction() {
    return this.matchKeywordValue(f.FUNCTION);
  }
  matchNew() {
    return this.matchKeywordValue(f.NEW);
  }
  matchTypeOf() {
    return this.matchKeywordValue(f.TYPEOF);
  }
  matchAwait() {
    return this.matchKeywordValue(f.AWAIT);
  }
  matchLambda() {
    return this.matchKeywordValue(f.LAMBDA);
  }
  expect(t) {
    const e = this.lex();
    (e.type !== p.PUNCT || e.value !== t) && this.throwUnexpectedToken(e);
  }
  lookahead(t = 0) {
    if (this.buf[t] !== void 0)
      return this.buf[t];
    const e = this.idx;
    this.buf.length && (this.idx = this.buf[this.buf.length - 1].range[1]);
    for (let r = this.buf.length; r <= t; r += 1)
      this.buf.push(this.advance());
    return this.idx = e, this.buf[t];
  }
  isLineCommentStart() {
    return this.codeChars[this.idx] === "/" && this.codeChars[this.idx + 1] === "/";
  }
  isLineCommentEnd() {
    return this.idx >= this.codeChars.length || this.codeChars[this.idx] === `
`;
  }
  isBlockCommentStart() {
    return this.codeChars[this.idx] === "/" && this.codeChars[this.idx + 1] === "*";
  }
  isBlockCommentEnd() {
    return this.codeChars[this.idx] === "*" && this.codeChars[this.idx + 1] === "/";
  }
  skipLineComment() {
    if (this.isLineCommentStart()) {
      for (; !this.isLineCommentEnd(); )
        ++this.idx;
      ++this.idx;
    }
  }
  skipBlockComment() {
    if (this.isBlockCommentStart()) {
      for (; !this.isBlockCommentEnd(); )
        ++this.idx;
      this.idx += 2;
    }
  }
  isWhiteSpace() {
    return ` \r
	`.includes(this.codeChars[this.idx]);
  }
  skipWhitespace() {
    for (; this.isWhiteSpace(); )
      ++this.idx;
  }
  skipInput() {
    for (; this.isWhiteSpace() || this.isBlockCommentStart() || this.isLineCommentStart(); )
      this.skipWhitespace(), this.skipLineComment(), this.skipBlockComment();
  }
  advance() {
    if (this.skipInput(), this.idx >= this.codeChars.length)
      return {
        type: p.EOT,
        range: [this.idx, this.idx],
        value: void 0
      };
    const t = this.scanRegularExpressions() ?? this.scanPunctuator() ?? this.scanID() ?? this.scanString() ?? this.scanInteger();
    if (t)
      return t;
    y.throwError(L.UNKNOWN_TOKEN);
  }
  value() {
    return this.lex().value;
  }
  ignoreTokens(t) {
    for (let e = 0; e < t; e++)
      this.lex();
  }
  lex() {
    if (this.buf[0]) {
      this.idx = this.buf[0].range[1];
      const t = this.buf[0];
      return this.buf = this.buf.slice(1), t;
    }
    return this.advance();
  }
  static isLiteralToken(t) {
    return t.type === p.BOOL || t.type === p.INT || t.type === p.FLOAT || t.type === p.STR || t.type === p.NULL || t.type === p.UNDEFINED || t.type === p.REGEXP;
  }
  throwUnexpectedToken(t) {
    const e = t ?? this.lookahead();
    e.type === p.EOT && y.throwError(L.UNEXP_EOT), y.throwError(L.UNEXP_TOKEN, e.value);
  }
  static throwError(t, ...e) {
    const r = t.replace(/%(\d)/g, (s, a) => e[a]);
    throw new M(r);
  }
  static isDigit(t) {
    return "0123456789".indexOf(t) >= 0;
  }
  static isIdStart(t) {
    return t === "_" || t === "$" || t >= "a" && t <= "z" || t >= "A" && t <= "Z";
  }
  static isIdPart(t) {
    return this.isIdStart(t) || t >= "0" && t <= "9";
  }
  static validateID(t) {
    t.startsWith(A) && y.throwError(L.RESERVED_ID, t);
  }
  scanID() {
    let t = this.codeChars[this.idx];
    if (!y.isIdStart(t))
      return;
    const e = this.idx;
    let r = t;
    for (; ++this.idx < this.codeChars.length && (t = this.codeChars[this.idx], !!y.isIdPart(t)); )
      r += t;
    if (y.isOperator(r))
      return {
        type: p.KEYWORD,
        value: r,
        range: [e, this.idx]
      };
    switch (r) {
      case "true":
      case "false":
        return {
          type: p.BOOL,
          value: r === "true",
          range: [e, this.idx]
        };
      case "null":
        return {
          type: p.NULL,
          value: null,
          range: [e, this.idx]
        };
      case "undefined":
        return {
          type: p.UNDEFINED,
          value: void 0,
          range: [e, this.idx]
        };
      default:
        return y.validateID(r), {
          type: p.ID,
          value: r,
          range: [e, this.idx]
        };
    }
  }
  scanString() {
    if (this.codeChars[this.idx] !== '"' && this.codeChars[this.idx] !== "`" && this.codeChars[this.idx] !== "'")
      return;
    const t = this.codeChars[this.idx], e = ++this.idx;
    let r = "", s = !1, a;
    for (; this.idx < this.codeChars.length; ) {
      if (a = this.codeChars[this.idx++], a === "\\")
        a = this.codeChars[this.idx++];
      else if ("'\"`".includes(a) && a === t) {
        s = !0;
        break;
      }
      r += a;
    }
    if (s)
      return {
        type: p.STR,
        value: r,
        range: [e, this.idx]
      };
    this.throwUnexpectedToken();
  }
  scanInteger() {
    const t = this.idx;
    let e = this.codeChars[this.idx];
    if (!y.isDigit(e))
      return;
    let r = e;
    for (; ++this.idx < this.codeChars.length && (e = this.codeChars[this.idx], !!y.isDigit(e)); )
      r += e;
    return {
      type: p.INT,
      value: r,
      range: [t, this.idx]
    };
  }
  scanPunctuatorForDots() {
    const t = this.idx, e = this.codeChars[this.idx], r = this.codeChars[this.idx + 1], s = this.codeChars[this.idx + 2];
    if (e === ".")
      return r === "(" && s === ")" ? (this.idx += 3, {
        type: p.PUNCT,
        value: ".()",
        range: [t, this.idx]
      }) : r === "." && s === "." ? (this.idx += 3, {
        type: p.PUNCT,
        value: "...",
        range: [t, this.idx]
      }) : r === "." ? (this.idx += 2, {
        type: p.PUNCT,
        value: "..",
        range: [t, this.idx]
      }) : {
        type: p.PUNCT,
        value: ".",
        range: [t, ++this.idx]
      };
  }
  scanPunctuatorForEquality() {
    const t = this.idx, e = this.codeChars[this.idx], r = this.codeChars[this.idx + 1], s = this.codeChars[this.idx + 2];
    if (r === "=") {
      if (s === "=") {
        if ("=!^$*".indexOf(e) >= 0)
          return this.idx += 3, {
            type: p.PUNCT,
            value: e + r + s,
            range: [t, this.idx]
          };
      } else if ("^$*".indexOf(s) >= 0) {
        if (e === "=")
          return this.idx += 3, {
            type: p.PUNCT,
            value: e + r + s,
            range: [t, this.idx]
          };
      } else if ("=!^$><".indexOf(e) >= 0)
        return this.idx += 2, {
          type: p.PUNCT,
          value: e + r,
          range: [t, this.idx]
        };
    } else if (e === "=")
      return "^$*~".indexOf(r) >= 0 ? (this.idx += 2, {
        type: p.PUNCT,
        value: e + r,
        range: [t, this.idx]
      }) : {
        type: p.PUNCT,
        value: e,
        range: [t, ++this.idx]
      };
  }
  scanPunctuatorForRepeatedTokens(t, e = 2) {
    const r = this.idx, s = this.codeChars[this.idx];
    let a = s;
    for (let h = 1; h < e; h++) {
      if (this.codeChars[this.idx + h] !== s)
        return;
      a += s;
    }
    if (t.includes(s))
      return this.idx += e, {
        type: p.PUNCT,
        value: a,
        range: [r, this.idx]
      };
  }
  scanSingleCharPunctuators() {
    const t = this.idx, e = this.codeChars[this.idx];
    if (`,;:{}()[]^+-*/%!><|=@~#?
`.includes(e))
      return {
        type: p.PUNCT,
        value: e,
        range: [t, ++this.idx]
      };
  }
  scanPunctuatorForQuestionMarks() {
    const t = this.idx, e = this.codeChars[this.idx], r = this.codeChars[this.idx + 1];
    if (e === "?" && y.isDigit(r))
      return this.idx += 2, {
        type: p.LAMBDA_ARG,
        value: Number(r),
        range: [t, this.idx]
      };
  }
  scanPunctuatorForPaths() {
    const t = this.idx, e = this.codeChars[this.idx], r = this.codeChars[this.idx + 1];
    if (e === "~" && "rsjm".includes(r))
      return this.idx += 2, {
        type: p.PUNCT,
        value: e + r,
        range: [t, this.idx]
      };
  }
  scanPunctuatorForArithmeticAssignment() {
    const t = this.idx, e = this.codeChars[this.idx], r = this.codeChars[this.idx + 1];
    if ("+-/*".includes(e) && r === "=")
      return this.idx += 2, {
        type: p.PUNCT,
        value: e + r,
        range: [t, this.idx]
      };
  }
  static isValidRegExp(t, e) {
    try {
      return RegExp(t, e), !0;
    } catch {
      return !1;
    }
  }
  getRegExpModifiers() {
    let t = "";
    for (; "gimsuyv".includes(this.codeChars[this.idx]); )
      t += this.codeChars[this.idx], this.idx++;
    return t;
  }
  scanRegularExpressions() {
    const t = this.idx;
    if (this.codeChars[this.idx] === "/") {
      let r = this.idx + 1;
      for (; r < this.codeChars.length; ) {
        if (this.codeChars[r] === `
`)
          return;
        if (this.codeChars[r] === "/")
          break;
        r++;
      }
      if (r < this.codeChars.length) {
        this.idx = r + 1;
        const s = this.getCode(t + 1, r), a = this.getRegExpModifiers();
        return y.isValidRegExp(s, a) || y.throwError("invalid regular expression '%0'", s), {
          type: p.REGEXP,
          value: this.getCode(t, this.idx),
          range: [t, this.idx]
        };
      }
    }
  }
  scanPunctuator() {
    return this.scanPunctuatorForDots() ?? this.scanPunctuatorForQuestionMarks() ?? this.scanPunctuatorForArithmeticAssignment() ?? this.scanPunctuatorForEquality() ?? this.scanPunctuatorForPaths() ?? this.scanPunctuatorForRepeatedTokens("?", 3) ?? this.scanPunctuatorForRepeatedTokens("|&*.=>?<+-", 2) ?? this.scanSingleCharPunctuators();
  }
}
class m extends Error {
}
function b(i) {
  if (i != null)
    return Array.isArray(i) ? i : [i];
}
function N(i) {
  if (i.length)
    return i[i.length - 1];
}
function v(i) {
  return {
    type: n.BLOCK_EXPR,
    statements: [i]
  };
}
function S(...i) {
  return {
    type: n.STATEMENTS_EXPR,
    statements: i
  };
}
function st(...i) {
  return (async function() {
  }).constructor(...i);
}
function it(i) {
  return typeof i == "object" && !Array.isArray(i) && Object.values(n).includes(i.type);
}
function g(i) {
  return typeof i != "string" ? "" : `"${i.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
class R {
  constructor(t, e) {
    this.pathTypesStack = [], this.loopCount = 0, this.lexer = t, this.options = e;
  }
  parse() {
    return this.lexer.init(), this.parseStatementsExpr();
  }
  parseEndOfStatement(t) {
    if (this.lexer.matchEOT() || this.lexer.match(t))
      return;
    if (this.lexer.match(";")) {
      this.lexer.ignoreTokens(1);
      return;
    }
    const e = this.lexer.currentIndex(), r = this.lexer.lookahead().range[0];
    this.lexer.getCode(e, r).includes(`
`) || this.lexer.throwUnexpectedToken();
  }
  parseStatements(t) {
    const e = [];
    for (; !this.lexer.matchEOT() && !this.lexer.match(t); )
      e.push(this.parseStatementExpr()), this.parseEndOfStatement(t);
    return e;
  }
  static validateStatements(t, e) {
    if (!t.length) {
      if ((e == null ? void 0 : e.parentType) === n.CONDITIONAL_EXPR || (e == null ? void 0 : e.parentType) === n.LOOP_EXPR)
        throw new m(
          "Empty statements are not allowed in loop and condtional expressions"
        );
      return;
    }
    for (let r = 0; r < t.length; r += 1) {
      const s = t[r];
      if ((s.type === n.RETURN_EXPR || s.type === n.THROW_EXPR || s.type === n.LOOP_CONTROL_EXPR) && ((e == null ? void 0 : e.parentType) !== n.CONDITIONAL_EXPR || r !== t.length - 1))
        throw new m(
          "return, throw, continue and break statements are only allowed as last statements in conditional expressions"
        );
    }
  }
  parseStatementsExpr(t) {
    const e = this.parseStatements(t == null ? void 0 : t.blockEnd);
    return R.validateStatements(e, t), {
      type: n.STATEMENTS_EXPR,
      statements: e
    };
  }
  parseStatementExpr() {
    return this.parseBaseExpr();
  }
  parseAssignmentExpr() {
    const t = this.parseNextExpr(l.ASSIGNMENT);
    if (t.type === n.PATH && this.lexer.matchAssignment()) {
      const e = this.lexer.value(), r = t;
      if (!r.root || typeof r.root == "object" || r.root === I)
        throw new m("Invalid assignment path");
      if (!R.isSimplePath(t))
        throw new m("Invalid assignment path");
      return r.inferredPathType = d.SIMPLE, {
        type: n.ASSIGNMENT_EXPR,
        value: this.parseBaseExpr(),
        op: e,
        path: r
      };
    }
    return t;
  }
  parseBaseExpr() {
    const t = this.lexer.currentIndex();
    try {
      return this.parseNextExpr(l.BASE);
    } catch (e) {
      const r = this.lexer.getCode(t, this.lexer.currentIndex());
      throw e.message.includes("at") ? e : new m(`${e.message} at ${r}`);
    }
  }
  parseNextExpr(t) {
    switch (t) {
      case l.CONDITIONAL:
        return this.parseAssignmentExpr();
      case l.ASSIGNMENT:
        return this.parseCoalesceExpr();
      case l.COALESCING:
        return this.parseLogicalORExpr();
      case l.OR:
        return this.parseLogicalANDExpr();
      case l.AND:
        return this.parseEqualityExpr();
      case l.EQUALITY:
        return this.parseRelationalExpr();
      case l.RELATIONAL:
        return this.parseShiftExpr();
      case l.SHIFT:
        return this.parseAdditiveExpr();
      case l.ADDITION:
        return this.parseMultiplicativeExpr();
      case l.MULTIPLICATION:
        return this.parsePowerExpr();
      case l.POWER:
        return this.parseUnaryExpr();
      case l.UNARY:
        return this.parsePrefixIncreamentExpr();
      case l.PREFIX_INCREMENT:
        return this.parsePostfixIncreamentExpr();
      case l.POSTFIX_INCREMENT:
        return this.parsePathAfterExpr();
      default:
        return this.parseConditionalExpr();
    }
  }
  parsePathPart() {
    if (this.lexer.match(".()"))
      this.lexer.ignoreTokens(1);
    else {
      if (this.lexer.match(".") && this.lexer.match("(", 1))
        return this.lexer.ignoreTokens(1), this.parseBlockExpr();
      if (this.lexer.match("("))
        return this.parseFunctionCallExpr();
      if (this.lexer.matchPathPartSelector())
        return this.parseSelector();
      if (this.lexer.matchToArray())
        return this.parsePathOptions();
      if (this.lexer.match("{"))
        return this.parseObjectFiltersExpr();
      if (this.lexer.match("["))
        return this.parseArrayFilterExpr();
      if (this.lexer.match("@") || this.lexer.match("#"))
        return this.parsePathOptions();
    }
  }
  parsePathParts() {
    let t = [], e = b(this.parsePathPart());
    for (; e && (t = t.concat(e), e[0].type !== n.FUNCTION_CALL_EXPR); )
      e = b(this.parsePathPart());
    return R.ignoreEmptySelectors(t);
  }
  parseContextVariable() {
    return this.lexer.ignoreTokens(1), this.lexer.matchID() || this.lexer.throwUnexpectedToken(), this.lexer.value();
  }
  parsePathOptions() {
    const t = {};
    for (; this.lexer.match("@") || this.lexer.match("#") || this.lexer.matchToArray(); ) {
      if (this.lexer.match("@")) {
        t.item = this.parseContextVariable();
        continue;
      }
      if (this.lexer.match("#")) {
        t.index = this.parseContextVariable();
        continue;
      }
      this.lexer.matchToArray() && (this.lexer.ignoreTokens(2), t.toArray = !0);
    }
    return {
      type: n.PATH_OPTIONS,
      options: t
    };
  }
  parsePathRoot(t, e) {
    if (e)
      return e;
    const r = this.lexer.lookahead();
    if (r.type === p.ID && r.value !== "$")
      return this.lexer.value();
    const s = {
      "^": I,
      $: t.inferredPathType === d.JSON ? I : O,
      "@": void 0
    };
    if (Object.prototype.hasOwnProperty.call(s, r.value))
      return this.lexer.ignoreTokens(1), s[r.value];
  }
  getInferredPathType() {
    var t;
    return this.pathTypesStack.length > 0 ? this.pathTypesStack[this.pathTypesStack.length - 1] : {
      pathType: d.UNKNOWN,
      inferredPathType: ((t = this.options) == null ? void 0 : t.defaultPathType) ?? d.RICH
    };
  }
  createPathResult(t) {
    return {
      pathType: t,
      inferredPathType: t
    };
  }
  parsePathType() {
    return this.lexer.matchSimplePath() ? (this.lexer.ignoreTokens(1), this.createPathResult(d.SIMPLE)) : this.lexer.matchRichPath() ? (this.lexer.ignoreTokens(1), this.createPathResult(d.RICH)) : this.lexer.matchJsonPath() ? (this.lexer.ignoreTokens(1), this.createPathResult(d.JSON)) : this.getInferredPathType();
  }
  parsePathTypeExpr() {
    const t = this.parsePathType();
    this.pathTypesStack.push(t);
    const e = this.parseBaseExpr();
    return this.pathTypesStack.pop(), e;
  }
  parsePath(t) {
    const e = this.parsePathType(), r = {
      type: n.PATH,
      root: this.parsePathRoot(e, t == null ? void 0 : t.root),
      parts: this.parsePathParts(),
      ...e
    };
    return r.parts.length ? this.updatePathExpr(r) : R.setPathTypeIfNotJSON(r, d.SIMPLE);
  }
  static createArrayIndexFilterExpr(t) {
    return {
      type: n.ARRAY_INDEX_FILTER_EXPR,
      indexes: {
        type: n.ARRAY_EXPR,
        elements: [t]
      }
    };
  }
  static createArrayFilterExpr(t) {
    return {
      type: n.ARRAY_FILTER_EXPR,
      filter: t
    };
  }
  parseSelector() {
    const t = this.lexer.value();
    if (this.lexer.matchINT())
      return R.createArrayFilterExpr(
        R.createArrayIndexFilterExpr(this.parseLiteralExpr())
      );
    let e;
    return (this.lexer.match("*") || this.lexer.matchID() || this.lexer.matchKeyword() || this.lexer.matchTokenType(p.STR)) && (e = this.lexer.lex(), e.type === p.KEYWORD && (e.type = p.ID)), {
      type: n.SELECTOR,
      selector: t,
      prop: e
    };
  }
  parseRangeFilterExpr() {
    if (this.lexer.match(":"))
      return this.lexer.ignoreTokens(1), {
        type: n.RANGE_FILTER_EXPR,
        toIdx: this.parseBaseExpr()
      };
    const t = this.parseBaseExpr();
    return this.lexer.match(":") ? (this.lexer.ignoreTokens(1), this.lexer.match("]") ? {
      type: n.RANGE_FILTER_EXPR,
      fromIdx: t
    } : {
      type: n.RANGE_FILTER_EXPR,
      fromIdx: t,
      toIdx: this.parseBaseExpr()
    }) : t;
  }
  parseArrayIndexFilterExpr(t) {
    const e = [];
    return t && (e.push(t), this.lexer.match("]") || this.lexer.expect(",")), {
      type: n.ARRAY_INDEX_FILTER_EXPR,
      indexes: {
        type: n.ARRAY_EXPR,
        elements: [
          ...e,
          ...this.parseCommaSeparatedElements("]", () => this.parseSpreadExpr())
        ]
      }
    };
  }
  parseArrayFilter() {
    if (this.lexer.matchSpread())
      return this.parseArrayIndexFilterExpr();
    const t = this.parseRangeFilterExpr();
    return t.type === n.RANGE_FILTER_EXPR ? t : this.parseArrayIndexFilterExpr(t);
  }
  parseObjectFilter() {
    let t = !1;
    return (this.lexer.match("~") || this.lexer.match("!")) && this.lexer.match("[", 1) && (this.lexer.ignoreTokens(1), t = !0), this.lexer.match("[") ? {
      type: n.OBJECT_INDEX_FILTER_EXPR,
      indexes: this.parseArrayExpr(),
      exclude: t
    } : {
      type: n.OBJECT_FILTER_EXPR,
      filter: this.parseBaseExpr()
    };
  }
  parseObjectFiltersExpr() {
    const t = [], e = [];
    for (; this.lexer.match("{"); ) {
      this.lexer.expect("{");
      const s = this.parseObjectFilter();
      s.type === n.OBJECT_INDEX_FILTER_EXPR ? e.push(s) : t.push(s.filter), this.lexer.expect("}"), this.lexer.match(".") && this.lexer.match("{", 1) && this.lexer.ignoreTokens(1);
    }
    return t.length ? [{
      type: n.OBJECT_FILTER_EXPR,
      filter: this.combineExpressionsAsBinaryExpr(t, n.LOGICAL_AND_EXPR, "&&")
    }, ...e] : e;
  }
  parseLoopControlExpr() {
    const t = this.lexer.value();
    if (!this.loopCount)
      throw new m(`encounted loop control outside loop: ${t}`);
    return {
      type: n.LOOP_CONTROL_EXPR,
      control: t
    };
  }
  parseCurlyBlockExpr(t) {
    this.lexer.expect("{");
    const e = this.parseStatementsExpr(t);
    return this.lexer.expect("}"), e;
  }
  parseConditionalBodyExpr() {
    const t = this.lexer.currentIndex();
    if (this.lexer.match("{"))
      try {
        return this.parseObjectExpr();
      } catch (e) {
        return e instanceof M && this.lexer.reset(t), this.parseCurlyBlockExpr({ blockEnd: "}", parentType: n.CONDITIONAL_EXPR });
      }
    return this.parseBaseExpr();
  }
  parseConditionalExpr() {
    const t = this.parseNextExpr(l.CONDITIONAL);
    if (this.lexer.match("?")) {
      this.lexer.ignoreTokens(1);
      const e = this.parseConditionalBodyExpr();
      let r;
      return this.lexer.match(":") && (this.lexer.ignoreTokens(1), r = this.parseConditionalBodyExpr()), {
        type: n.CONDITIONAL_EXPR,
        if: t,
        then: e,
        else: r
      };
    }
    return t;
  }
  parseLoopExpr() {
    this.loopCount++, this.lexer.ignoreTokens(1);
    let t, e, r;
    this.lexer.match("{") || (this.lexer.expect("("), this.lexer.match(";") || (t = this.parseAssignmentExpr()), this.lexer.expect(";"), this.lexer.match(";") || (e = this.parseLogicalORExpr()), this.lexer.expect(";"), this.lexer.match(")") || (r = this.parseAssignmentExpr()), this.lexer.expect(")"));
    const s = this.parseCurlyBlockExpr({ blockEnd: "}", parentType: n.LOOP_EXPR });
    return this.loopCount--, {
      type: n.LOOP_EXPR,
      init: t,
      test: e,
      update: r,
      body: s
    };
  }
  parseJSONObjectFilter() {
    this.lexer.expect("?"), this.lexer.expect("(");
    const t = this.parseBaseExpr();
    return this.lexer.expect(")"), {
      type: n.OBJECT_FILTER_EXPR,
      filter: t
    };
  }
  parseAllFilter() {
    return this.lexer.expect("*"), {
      type: n.OBJECT_FILTER_EXPR,
      filter: {
        type: n.ALL_FILTER_EXPR
      }
    };
  }
  parseArrayFilterExpr() {
    this.lexer.expect("[");
    let t;
    return this.lexer.match("?") ? t = this.parseJSONObjectFilter() : this.lexer.match("*") ? t = this.parseAllFilter() : t = {
      type: n.ARRAY_FILTER_EXPR,
      filter: this.parseArrayFilter()
    }, this.lexer.expect("]"), t;
  }
  combineExpressionsAsBinaryExpr(t, e, r) {
    if (!(t != null && t.length))
      throw new m("expected at least 1 expression");
    return t.length === 1 ? t[0] : {
      type: e,
      op: r,
      args: [t.shift(), this.combineExpressionsAsBinaryExpr(t, e, r)]
    };
  }
  parseArrayCoalesceExpr() {
    this.lexer.ignoreTokens(1);
    const t = this.parseArrayExpr();
    return this.combineExpressionsAsBinaryExpr(
      t.elements,
      n.LOGICAL_COALESCE_EXPR,
      "??"
    );
  }
  parseCoalesceExpr() {
    const t = this.parseNextExpr(l.COALESCING);
    return this.lexer.match("??") ? {
      type: n.LOGICAL_COALESCE_EXPR,
      op: this.lexer.value(),
      args: [t, this.parseCoalesceExpr()]
    } : t;
  }
  parseLogicalORExpr() {
    const t = this.parseNextExpr(l.OR);
    return this.lexer.match("||") ? {
      type: n.LOGICAL_OR_EXPR,
      op: this.lexer.value(),
      args: [t, this.parseLogicalORExpr()]
    } : t;
  }
  parseLogicalANDExpr() {
    const t = this.parseNextExpr(l.AND);
    return this.lexer.match("&&") ? {
      type: n.LOGICAL_AND_EXPR,
      op: this.lexer.value(),
      args: [t, this.parseLogicalANDExpr()]
    } : t;
  }
  parseEqualityExpr() {
    const t = this.parseNextExpr(l.EQUALITY);
    return this.lexer.match("==") || this.lexer.match("!=") || this.lexer.match("===") || this.lexer.match("!==") || this.lexer.match("^==") || this.lexer.match("==^") || this.lexer.match("^=") || this.lexer.match("=^") || this.lexer.match("$==") || this.lexer.match("==$") || this.lexer.match("$=") || this.lexer.match("=$") || this.lexer.match("==*") || this.lexer.match("=~") || this.lexer.match("=*") ? {
      type: n.COMPARISON_EXPR,
      op: this.lexer.value(),
      args: [t, this.parseEqualityExpr()]
    } : t;
  }
  parseInExpr(t) {
    return this.lexer.ignoreTokens(1), {
      type: n.IN_EXPR,
      op: f.IN,
      args: [t, this.parseRelationalExpr()]
    };
  }
  parseRelationalExpr() {
    const t = this.parseNextExpr(l.RELATIONAL);
    return this.lexer.match("<") || this.lexer.match(">") || this.lexer.match("<=") || this.lexer.match(">=") || this.lexer.matchContains() || this.lexer.matchSize() || this.lexer.matchEmpty() || this.lexer.matchAnyOf() || this.lexer.matchSubsetOf() ? {
      type: n.COMPARISON_EXPR,
      op: this.lexer.value(),
      args: [t, this.parseRelationalExpr()]
    } : this.lexer.matchIN() ? this.parseInExpr(t) : this.lexer.matchNotIN() ? {
      type: n.UNARY_EXPR,
      op: "!",
      arg: v(this.parseInExpr(t))
    } : this.lexer.matchNoneOf() ? (this.lexer.ignoreTokens(1), {
      type: n.UNARY_EXPR,
      op: "!",
      arg: v({
        type: n.COMPARISON_EXPR,
        op: f.ANYOF,
        args: [t, this.parseRelationalExpr()]
      })
    }) : t;
  }
  parseShiftExpr() {
    const t = this.parseNextExpr(l.SHIFT);
    return this.lexer.match(">>") || this.lexer.match("<<") ? {
      type: n.MATH_EXPR,
      op: this.lexer.value(),
      args: [t, this.parseShiftExpr()]
    } : t;
  }
  parseAdditiveExpr() {
    const t = this.parseNextExpr(l.ADDITION);
    return this.lexer.match("+") || this.lexer.match("-") ? {
      type: n.MATH_EXPR,
      op: this.lexer.value(),
      args: [t, this.parseAdditiveExpr()]
    } : t;
  }
  parseMultiplicativeExpr() {
    const t = this.parseNextExpr(l.MULTIPLICATION);
    return this.lexer.match("*") || this.lexer.match("/") || this.lexer.match("%") ? {
      type: n.MATH_EXPR,
      op: this.lexer.value(),
      args: [t, this.parseMultiplicativeExpr()]
    } : t;
  }
  parsePowerExpr() {
    const t = this.parseNextExpr(l.POWER);
    return this.lexer.match("**") ? {
      type: n.MATH_EXPR,
      op: this.lexer.value(),
      args: [t, this.parsePowerExpr()]
    } : t;
  }
  parsePrefixIncreamentExpr() {
    if (this.lexer.matchIncrement() || this.lexer.matchDecrement()) {
      const t = this.lexer.value();
      if (!this.lexer.matchID())
        throw new m("Invalid prefix increment expression");
      const e = this.lexer.value();
      return {
        type: n.INCREMENT,
        op: t,
        id: e
      };
    }
    return this.parseNextExpr(l.PREFIX_INCREMENT);
  }
  static convertToID(t) {
    if (t.type === n.PATH) {
      const e = t;
      if (!e.root || typeof e.root != "string" || e.parts.length !== 0 || e.root === I || e.root === O)
        throw new m("Invalid postfix increment expression");
      return e.root;
    }
    throw new m("Invalid postfix increment expression");
  }
  parsePostfixIncreamentExpr() {
    const t = this.parseNextExpr(l.POSTFIX_INCREMENT);
    return this.lexer.matchIncrement() || this.lexer.matchDecrement() ? {
      type: n.INCREMENT,
      op: this.lexer.value(),
      id: R.convertToID(t),
      postfix: !0
    } : t;
  }
  parseUnaryExpr() {
    return this.lexer.match("!") || this.lexer.match("+") || this.lexer.match("-") || this.lexer.matchTypeOf() || this.lexer.matchAwait() ? {
      type: n.UNARY_EXPR,
      op: this.lexer.value(),
      arg: this.parseUnaryExpr()
    } : this.parseNextExpr(l.UNARY);
  }
  shouldSkipPathParsing(t) {
    switch (t.type) {
      case n.EMPTY:
      case n.DEFINITION_EXPR:
      case n.ASSIGNMENT_EXPR:
      case n.SPREAD_EXPR:
        return !0;
      case n.LITERAL:
      case n.MATH_EXPR:
      case n.COMPARISON_EXPR:
      case n.ARRAY_EXPR:
      case n.OBJECT_EXPR:
        if (this.lexer.match("("))
          return !0;
        break;
      case n.FUNCTION_EXPR:
        if (!this.lexer.match("("))
          return !0;
        break;
    }
    return !1;
  }
  parsePathAfterExpr() {
    let t = this.parsePrimaryExpr();
    if (this.shouldSkipPathParsing(t))
      return t;
    for (; this.lexer.matchPathType() || this.lexer.matchPathPartSelector() || this.lexer.match("{") || this.lexer.match("[") || this.lexer.match("("); )
      t = this.parsePath({ root: t });
    return t;
  }
  static createLiteralExpr(t) {
    return {
      type: n.LITERAL,
      value: t.value,
      tokenType: t.type
    };
  }
  parseLiteralExpr() {
    return R.createLiteralExpr(this.lexer.lex());
  }
  parseIDPath() {
    const t = [];
    for (; this.lexer.matchID(); ) {
      let e = this.lexer.value();
      e === "$" && (e = O), t.push(e), this.lexer.match(".") && this.lexer.matchID(1) && this.lexer.ignoreTokens(1);
    }
    return t.length || this.lexer.throwUnexpectedToken(), t.join(".");
  }
  parseObjectDefVars() {
    const t = [];
    for (this.lexer.expect("{"); !this.lexer.match("}"); ) {
      if (!this.lexer.matchID())
        throw new m("Invalid object vars");
      t.push(this.lexer.value()), this.lexer.match("}") || this.lexer.expect(",");
    }
    if (this.lexer.expect("}"), t.length === 0)
      throw new m("Empty object vars");
    return t;
  }
  parseNormalDefVars() {
    const t = [];
    if (!this.lexer.matchID())
      throw new m("Invalid normal vars");
    return t.push(this.lexer.value()), t;
  }
  parseDefinitionExpr() {
    const t = this.lexer.value(), e = this.lexer.match("{"), r = e ? this.parseObjectDefVars() : this.parseNormalDefVars();
    return this.lexer.expect("="), {
      type: n.DEFINITION_EXPR,
      value: this.parseBaseExpr(),
      vars: r,
      definition: t,
      fromObject: e
    };
  }
  parseFunctionCallArgs() {
    this.lexer.expect("(");
    const t = this.parseCommaSeparatedElements(")", () => this.parseSpreadExpr());
    return this.lexer.expect(")"), t;
  }
  parseFunctionCallExpr() {
    let t;
    return this.lexer.matchNew() && (this.lexer.ignoreTokens(1), t = `new ${this.parseIDPath()}`), {
      type: n.FUNCTION_CALL_EXPR,
      args: this.parseFunctionCallArgs(),
      id: t
    };
  }
  parseFunctionDefinitionParam() {
    let t = "";
    return this.lexer.matchSpread() && (this.lexer.ignoreTokens(1), t = "...", this.lexer.match(")", 1) || this.lexer.throwUnexpectedToken()), this.lexer.matchID() || this.lexer.throwUnexpectedToken(), `${t}${this.lexer.value()}`;
  }
  parseFunctionDefinitionParams() {
    this.lexer.expect("(");
    const t = this.parseCommaSeparatedElements(")", () => this.parseFunctionDefinitionParam());
    return this.lexer.expect(")"), t;
  }
  parseFunctionExpr(t = !1) {
    this.lexer.ignoreTokens(1);
    const e = this.parseFunctionDefinitionParams();
    return {
      type: n.FUNCTION_EXPR,
      params: e,
      body: this.parseCurlyBlockExpr({ blockEnd: "}" }),
      async: t
    };
  }
  parseObjectKeyExpr() {
    let t;
    return this.lexer.match("[") ? (this.lexer.ignoreTokens(1), t = this.parseBaseExpr(), this.lexer.expect("]")) : this.lexer.matchID() || this.lexer.matchKeyword() ? t = this.lexer.value() : this.lexer.matchLiteral() && !this.lexer.matchTokenType(p.REGEXP) ? t = this.lexer.value().toString() : this.lexer.throwUnexpectedToken(), t;
  }
  parseShortKeyValueObjectPropExpr() {
    if ((this.lexer.matchID() || this.lexer.matchKeyword()) && (this.lexer.match(",", 1) || this.lexer.match("}", 1))) {
      const t = this.lexer.lookahead().value, e = this.parseBaseExpr();
      return {
        type: n.OBJECT_PROP_EXPR,
        key: t,
        value: e
      };
    }
  }
  parseSpreadObjectPropExpr() {
    if (this.lexer.matchSpread())
      return {
        type: n.OBJECT_PROP_EXPR,
        value: this.parseSpreadExpr()
      };
  }
  getObjectPropContextVar() {
    if (this.lexer.matchObjectContextProp())
      return this.lexer.ignoreTokens(1), this.lexer.value();
  }
  parseNormalObjectPropExpr() {
    const t = this.getObjectPropContextVar(), e = this.parseObjectKeyExpr();
    if (t && typeof e == "string")
      throw new m("Context prop should be used with a key expression");
    this.lexer.expect(":");
    const r = this.parseBaseExpr();
    return {
      type: n.OBJECT_PROP_EXPR,
      key: e,
      value: r,
      contextVar: t
    };
  }
  parseObjectPropExpr() {
    return this.parseSpreadObjectPropExpr() ?? this.parseShortKeyValueObjectPropExpr() ?? this.parseNormalObjectPropExpr();
  }
  parseObjectExpr() {
    this.lexer.expect("{");
    const t = this.parseCommaSeparatedElements("}", () => this.parseObjectPropExpr());
    return this.lexer.expect("}"), {
      type: n.OBJECT_EXPR,
      props: t
    };
  }
  parseCommaSeparatedElements(t, e) {
    const r = [];
    for (; !this.lexer.match(t); )
      r.push(e()), this.lexer.match(t) || this.lexer.expect(",");
    return r;
  }
  parseSpreadExpr() {
    return this.lexer.matchSpread() ? (this.lexer.ignoreTokens(1), {
      type: n.SPREAD_EXPR,
      value: this.parseBaseExpr()
    }) : this.parseBaseExpr();
  }
  parseArrayExpr() {
    this.lexer.expect("[");
    const t = this.parseCommaSeparatedElements("]", () => this.parseSpreadExpr());
    return this.lexer.expect("]"), {
      type: n.ARRAY_EXPR,
      elements: t
    };
  }
  parseBlockExpr() {
    this.lexer.expect("(");
    const t = this.parseStatements(")");
    if (this.lexer.expect(")"), t.length === 0)
      throw new m("empty block is not allowed");
    return {
      type: n.BLOCK_EXPR,
      statements: t
    };
  }
  parseAsyncFunctionExpr() {
    if (this.lexer.ignoreTokens(1), this.lexer.matchFunction())
      return this.parseFunctionExpr(!0);
    if (this.lexer.matchLambda())
      return this.parseLambdaExpr(!0);
    this.lexer.throwUnexpectedToken();
  }
  parseLambdaExpr(t = !1) {
    this.lexer.ignoreTokens(1);
    const e = this.parseBaseExpr();
    return {
      type: n.FUNCTION_EXPR,
      body: S(e),
      params: ["...args"],
      async: t,
      lambda: !0
    };
  }
  parseCompileTimeBaseExpr() {
    this.lexer.expect("{"), this.lexer.expect("{");
    const t = this.parseBaseExpr();
    return this.lexer.expect("}"), this.lexer.expect("}"), t;
  }
  parseCompileTimeExpr() {
    var a;
    this.lexer.expect("{"), this.lexer.expect("{");
    const t = this.lexer.matchCompileTimeExpr(), e = t ? this.parseCompileTimeBaseExpr() : this.parseBaseExpr();
    this.lexer.expect("}"), this.lexer.expect("}");
    const r = x.createAsSync(e).evaluate(
      {},
      (a = this.options) == null ? void 0 : a.compileTimeBindings
    ), s = t ? r : JSON.stringify(r);
    return R.parseBaseExprFromTemplate(s);
  }
  parseNumber() {
    let t = this.lexer.value();
    return this.lexer.match(".") ? (t += this.lexer.value(), this.lexer.matchINT() && (t += this.lexer.value()), {
      type: n.LITERAL,
      value: parseFloat(t),
      tokenType: p.FLOAT
    }) : {
      type: n.LITERAL,
      value: parseInt(t, 10),
      tokenType: p.INT
    };
  }
  parseFloatingNumber() {
    const t = this.lexer.value() + this.lexer.value();
    return {
      type: n.LITERAL,
      value: parseFloat(t),
      tokenType: p.FLOAT
    };
  }
  parseReturnExpr() {
    this.lexer.ignoreTokens(1);
    let t;
    return this.lexer.match(";") || (t = this.parseBaseExpr()), {
      type: n.RETURN_EXPR,
      value: t
    };
  }
  parseThrowExpr() {
    return this.lexer.ignoreTokens(1), {
      type: n.THROW_EXPR,
      value: this.parseBaseExpr()
    };
  }
  parseKeywordBasedExpr() {
    switch (this.lexer.lookahead().value) {
      case f.NEW:
        return this.parseFunctionCallExpr();
      case f.LAMBDA:
        return this.parseLambdaExpr();
      case f.ASYNC:
        return this.parseAsyncFunctionExpr();
      case f.RETURN:
        return this.parseReturnExpr();
      case f.THROW:
        return this.parseThrowExpr();
      case f.FUNCTION:
        return this.parseFunctionExpr();
      case f.FOR:
        return this.parseLoopExpr();
      case f.CONTINUE:
      case f.BREAK:
        return this.parseLoopControlExpr();
      default:
        return this.parseDefinitionExpr();
    }
  }
  static isValidMapping(t) {
    return typeof t.key == "string" && t.value.type === n.LITERAL && t.value.tokenType === p.STR;
  }
  static convertMappingsToFlatPaths(t) {
    const e = {};
    for (const r of t.props) {
      if (!R.isValidMapping(r))
        throw new m(
          `Invalid mapping key=${JSON.stringify(r.key)} or value=${JSON.stringify(
            r.value
          )}, expected string key and string value`
        );
      e[r.key] = r.value.value;
    }
    if (!e.input || !e.output)
      throw new m(
        `Invalid mapping: ${JSON.stringify(e)}, missing input or output`
      );
    return e;
  }
  parseMappings() {
    this.lexer.expect("~m");
    const t = this.parseArrayExpr(), e = [];
    for (const r of t.elements) {
      if (r.type !== n.OBJECT_EXPR)
        throw new m(
          `Invalid mapping=${JSON.stringify(r)}, expected object`
        );
      e.push(R.convertMappingsToFlatPaths(r));
    }
    return x.parseMappingPaths(e);
  }
  parsePrimaryExpr() {
    return this.lexer.match(";") ? X : this.lexer.matchTokenType(p.LAMBDA_ARG) ? {
      type: n.LAMBDA_ARG,
      index: this.lexer.value()
    } : this.lexer.matchKeyword() ? this.parseKeywordBasedExpr() : this.lexer.matchINT() ? this.parseNumber() : this.lexer.match("???") ? this.parseArrayCoalesceExpr() : this.lexer.match(".") && this.lexer.matchINT(1) && !this.lexer.match(".", 2) ? this.parseFloatingNumber() : this.lexer.matchLiteral() ? this.parseLiteralExpr() : this.lexer.matchCompileTimeExpr() ? this.parseCompileTimeExpr() : this.lexer.match("{") ? this.parseObjectExpr() : this.lexer.match("[") ? this.parseArrayExpr() : this.lexer.matchPathType() ? this.parsePathTypeExpr() : this.lexer.matchMappings() ? this.parseMappings() : this.lexer.matchPath() ? this.parsePath() : this.lexer.match("(") ? this.parseBlockExpr() : this.lexer.throwUnexpectedToken();
  }
  shouldPathBeConvertedAsBlock(t) {
    var e;
    return !((e = this.options) != null && e.mappings) && t.filter(
      (r, s) => r.type === n.PATH_OPTIONS && s !== t.length - 1
    ).some((r) => {
      var s, a;
      return ((s = r.options) == null ? void 0 : s.index) ?? ((a = r.options) == null ? void 0 : a.item);
    });
  }
  static convertToBlockExpr(t) {
    return {
      type: n.FUNCTION_EXPR,
      block: !0,
      body: S(t)
    };
  }
  static ignoreEmptySelectors(t) {
    return t.filter(
      (e) => !(e.type === n.SELECTOR && e.selector === "." && !e.prop)
    );
  }
  static combinePathOptionParts(t) {
    if (t.length < 2)
      return t;
    const e = [];
    for (let r = 0; r < t.length; r += 1) {
      const s = t[r];
      r < t.length - 1 && t[r + 1].type === n.PATH_OPTIONS && (s.options = t[r + 1].options, r++), e.push(s);
    }
    return e;
  }
  static convertToFunctionCallExpr(t, e) {
    var a;
    const r = N(e.parts), s = t;
    if ((r == null ? void 0 : r.type) === n.SELECTOR) {
      const h = r;
      h.selector === "." && ((a = h.prop) == null ? void 0 : a.type) === p.ID && (e.parts.pop(), s.id = h.prop.value);
    }
    return !e.parts.length && e.root && typeof e.root != "object" ? s.parent = e.root : s.object = e, s;
  }
  static isArrayFilterExpressionSimple(t) {
    return t.filter.type !== n.ARRAY_INDEX_FILTER_EXPR ? !1 : t.filter.indexes.elements.length <= 1;
  }
  static isSimplePathPart(t) {
    if (t.type === n.SELECTOR) {
      const e = t;
      return e.selector === "." && !!e.prop && e.prop.type !== p.PUNCT;
    }
    return t.type === n.ARRAY_FILTER_EXPR ? this.isArrayFilterExpressionSimple(t) : !1;
  }
  static isSimplePath(t) {
    return t.parts.every((e) => this.isSimplePathPart(e));
  }
  static isRichPath(t) {
    return t.parts.length ? !this.isSimplePath(t) : !1;
  }
  static setPathTypeIfNotJSON(t, e) {
    const r = t;
    return t.inferredPathType !== d.JSON && (r.inferredPathType = e), r;
  }
  updatePathExpr(t) {
    var o, c;
    const e = t;
    e.parts.length > 1 && e.parts[0].type === n.PATH_OPTIONS && (e.options = e.parts[0].options, e.parts.shift());
    const r = this.shouldPathBeConvertedAsBlock(e.parts);
    let s = N(e.parts), a;
    (s == null ? void 0 : s.type) === n.FUNCTION_CALL_EXPR && (a = e.parts.pop()), s = N(e.parts), (s == null ? void 0 : s.type) === n.PATH_OPTIONS && ((o = s.options) != null && o.toArray) && (e.returnAsArray = (c = s.options) == null ? void 0 : c.toArray, !s.options.item && !s.options.index ? e.parts.pop() : s.options.toArray = !1), e.parts = R.combinePathOptionParts(e.parts);
    let h = e;
    return a && (h = R.convertToFunctionCallExpr(a, e)), r ? (h = R.convertToBlockExpr(h), R.setPathTypeIfNotJSON(e, d.RICH)) : R.isRichPath(e) && R.setPathTypeIfNotJSON(e, d.RICH), h;
  }
  static parseBaseExprFromTemplate(t) {
    const e = new y(t);
    return new R(e).parseBaseExpr();
  }
}
function W(i, t) {
  return i === p.STR ? g(String(t)) : String(t);
}
function T() {
  return {
    type: n.OBJECT_EXPR,
    props: []
  };
}
function nt(i, t) {
  let e = i.find((r) => r.key === t);
  return e || (e = {
    type: n.OBJECT_PROP_EXPR,
    key: t,
    value: T()
  }, i.push(e)), e;
}
function at(i, t, e, r) {
  const s = e.indexes.elements[0].value;
  if (t.value.type !== n.ARRAY_EXPR) {
    const a = [];
    a[s] = r ? i.inputExpr : t.value, t.value = {
      type: n.ARRAY_EXPR,
      elements: a
    };
  } else t.value.elements[s] || (t.value.elements[s] = r ? i.inputExpr : T());
  return t.value.elements[s];
}
function Y(i) {
  var t;
  return i.type === n.PATH && i.parts.length === 0 && ((t = i.root) == null ? void 0 : t.type) === n.OBJECT_EXPR;
}
function H(i, t, e = []) {
  return {
    type: n.PATH,
    root: t,
    pathType: i.pathType || d.UNKNOWN,
    inferredPathType: i.inferredPathType || d.UNKNOWN,
    parts: e,
    returnAsArray: !0
  };
}
function ht(i, t) {
  if (!(i != null && i.props) || i.type !== n.OBJECT_EXPR || !Array.isArray(i.props))
    throw new $(
      "Invalid mapping: invalid array mapping",
      t.input,
      t.output
    );
}
function ot(i) {
  return {
    type: n.PATH,
    root: i,
    returnAsArray: !0,
    parts: []
  };
}
function pt(i, t) {
  var e;
  for (let r = 0; r < t.length; r++)
    t[r].type === n.OBJECT_FILTER_EXPR && i[r].type === n.OBJECT_FILTER_EXPR && ((e = t[r].options) != null && e.index && (i[r].options = { ...i[r].options, ...t[r].options }), t[r].filter.type !== n.ALL_FILTER_EXPR && (i[r].filter = t[r].filter));
}
function ut(i, t, e, r) {
  const s = i.parts.splice(0, e + 1);
  Y(t.value) && (t.value = t.value.root), t.value.type !== n.PATH ? (s.push(
    v(r ? i : t.value)
  ), t.value = H(
    i,
    i.root,
    s
  )) : pt(t.value.parts, s), i.root = void 0;
}
function ct(i) {
  let t = -1;
  return i.type === n.PATH && (t = i.parts.findIndex((e) => e.type === n.OBJECT_FILTER_EXPR)), t;
}
function lt(i, t, e) {
  if (t.value.type === n.OBJECT_EXPR) {
    const r = t.value;
    return t.value = e ? ot(i) : H(i, r), r;
  }
  if (Y(t.value))
    return t.value.root;
}
function Et(i, t, e) {
  var a;
  const r = N(t.value.parts), s = e ? T() : (a = r == null ? void 0 : r.statements) == null ? void 0 : a[0];
  return ht(s, i), s;
}
function xt(i, t, e) {
  const { inputExpr: r } = i, s = ct(r);
  if (s === -1) {
    const a = lt(
      r,
      t,
      e
    );
    if (a)
      return a;
  } else
    ut(r, t, s, e);
  return Et(i, t, e);
}
function q(i) {
  var t;
  return i.type === n.SELECTOR && ((t = i.prop) == null ? void 0 : t.value) === "*";
}
function ft(i, t, e = !1) {
  const r = i.inputExpr, s = r.parts.findIndex(q);
  if (s === -1)
    throw new $(
      "Invalid mapping: input should have wildcard selector",
      i.input,
      i.output
    );
  const a = r.parts.splice(0, s);
  r.parts = r.parts.slice(1), t.value.type !== n.PATH && (a.push(v(t.value)), t.value = {
    type: n.PATH,
    root: r.root,
    pathType: r.pathType,
    inferredPathType: r.inferredPathType,
    parts: a
  }), r.root = "e.value";
  const o = N(t.value.parts).statements[0], c = T();
  return o.props.push({
    type: n.OBJECT_PROP_EXPR,
    key: {
      type: n.PATH,
      root: "e",
      parts: [
        {
          type: n.SELECTOR,
          selector: ".",
          prop: {
            type: p.ID,
            value: "key"
          }
        }
      ]
    },
    value: e ? r : c,
    contextVar: "e"
  }), c;
}
function dt(i, t, e) {
  var s, a, h, o, c, E;
  const r = i.outputExpr.parts[t];
  if (((s = r.filter) == null ? void 0 : s.type) === n.ALL_FILTER_EXPR) {
    const P = xt(
      i,
      e,
      t === i.outputExpr.parts.length - 1 && !((a = r.options) != null && a.index)
    );
    return (h = r.options) != null && h.index && P.props.push({
      type: n.OBJECT_PROP_EXPR,
      key: (o = r.options) == null ? void 0 : o.index,
      value: {
        type: n.PATH,
        root: (c = r.options) == null ? void 0 : c.index,
        parts: []
      }
    }), P;
  }
  if (((E = r.filter) == null ? void 0 : E.type) === n.ARRAY_INDEX_FILTER_EXPR)
    return at(
      i,
      e,
      r.filter,
      t === i.outputExpr.parts.length - 1
    );
  if (q(r))
    return ft(
      i,
      e,
      t === i.outputExpr.parts.length - 1
    );
}
function G(i, t, e) {
  let r = e.value, s = t;
  for (; s < i.outputExpr.parts.length; ) {
    const a = dt(i, s, e);
    if (!a)
      break;
    s++, r = a;
  }
  return r;
}
function K(i) {
  var t;
  return i.type === n.SELECTOR && ((t = i.prop) == null ? void 0 : t.value) && i.prop.value !== "*";
}
function k(i) {
  return i.type === n.PATH && i.root === void 0 && i.parts.length === 1 && i.parts[0].type === n.BLOCK_EXPR ? i.parts[0].statements[0] : i;
}
function Pt(i, t, e) {
  const r = t.find((s) => s.key === e);
  r ? r.value = {
    type: n.LOGICAL_OR_EXPR,
    op: "||",
    args: [r.value, k(i.inputExpr)]
  } : t.push({
    type: n.OBJECT_PROP_EXPR,
    key: e,
    value: k(i.inputExpr)
  });
}
function Rt(i, t, e) {
  const r = i.outputExpr.parts[t];
  if (!K(r))
    return e;
  const s = r.prop.value;
  if (t === i.outputExpr.parts.length - 1)
    return Pt(i, e, s), e;
  const a = nt(e, s);
  return G(i, t + 1, a).props;
}
function mt(i, t) {
  t.props.push({
    type: n.OBJECT_PROP_EXPR,
    value: {
      type: n.SPREAD_EXPR,
      value: i.inputExpr
    }
  });
}
function yt(i, t) {
  if (i.inputExpr.type !== n.PATH)
    throw new $(
      "Invalid mapping: input should be path expression",
      i.input,
      i.output
    );
  if (!i.inputExpr.parts.some(
    (r) => {
      var s;
      return (r == null ? void 0 : r.type) === n.OBJECT_FILTER_EXPR && ((s = r.options) == null ? void 0 : s.index) === t;
    }
  ))
    throw new $(
      `Invalid mapping: index variable:${t} not found in input path`,
      i.input,
      i.output
    );
}
function At(i) {
  var e;
  if (i.outputExpr.type !== n.PATH)
    throw new $(
      "Invalid mapping: output should be a path expression",
      i.input,
      i.output
    );
  const t = N(i.outputExpr.parts);
  (e = t == null ? void 0 : t.options) != null && e.index && yt(i, t.options.index);
}
function It(i, t) {
  let e = t.props;
  for (let r = 0; r < i.outputExpr.parts.length; r++)
    e = Rt(i, r, e);
}
function Ot(i) {
  const t = T();
  let e;
  for (const r of i) {
    At(r);
    let s = t;
    if (r.outputExpr.parts.length > 0) {
      if (!K(r.outputExpr.parts[0])) {
        const a = {
          type: n.OBJECT_PROP_EXPR,
          key: "",
          value: e || s
        };
        s = G(r, 0, a), e = a.value;
      }
      It(r, s);
    } else
      mt(r, t);
  }
  return e ?? t;
}
class Ct {
  constructor(t) {
    this.level = 0, this.options = t;
  }
  translate(t) {
    var r;
    let e = this.translateExpression(t);
    return e = e.replace(/\.\s+\./g, "."), ((r = this.options) == null ? void 0 : r.defaultPathType) === d.JSON && (e = e.replace(/\^/g, "$")), e;
  }
  translateExpression(t) {
    switch (t.type) {
      case n.LITERAL:
        return this.translateLiteralExpression(t);
      case n.STATEMENTS_EXPR:
        return this.translateStatementsExpression(t);
      case n.MATH_EXPR:
      case n.COMPARISON_EXPR:
      case n.IN_EXPR:
      case n.LOGICAL_AND_EXPR:
      case n.LOGICAL_OR_EXPR:
      case n.LOGICAL_COALESCE_EXPR:
        return this.translateBinaryExpression(t);
      case n.ARRAY_EXPR:
        return this.translateArrayExpression(t);
      case n.OBJECT_EXPR:
        return this.translateObjectExpression(t);
      case n.SPREAD_EXPR:
        return this.translateSpreadExpression(t);
      case n.BLOCK_EXPR:
        return this.translateBlockExpression(t);
      case n.UNARY_EXPR:
        return this.translateUnaryExpression(t);
      case n.INCREMENT:
        return this.translateIncrementExpression(t);
      case n.PATH:
        return this.translatePathExpression(t);
      case n.CONDITIONAL_EXPR:
        return this.translateConditionalExpression(t);
      case n.DEFINITION_EXPR:
        return this.translateDefinitionExpression(t);
      case n.ASSIGNMENT_EXPR:
        return this.translateAssignmentExpression(t);
      case n.FUNCTION_CALL_EXPR:
        return this.translateFunctionCallExpression(t);
      case n.FUNCTION_EXPR:
        return this.translateFunctionExpression(t);
      case n.THROW_EXPR:
        return this.translateThrowExpression(t);
      case n.RETURN_EXPR:
        return this.translateReturnExpression(t);
      case n.LOOP_EXPR:
        return this.translateLoopExpression(t);
      case n.LOOP_CONTROL_EXPR:
        return this.translateLoopControlExpression(t);
      case n.LAMBDA_ARG:
        return this.translateLambdaArgExpression(t);
      case n.OBJECT_FILTER_EXPR:
        return this.translateObjectFilterExpression(t);
      case n.SELECTOR:
        return this.translateSelectorExpression(t);
      case n.OBJECT_PROP_EXPR:
        return this.translateObjectPropExpression(t);
      case n.OBJECT_INDEX_FILTER_EXPR:
        return this.translateObjectIndexFilterExpression(t);
      case n.ARRAY_FILTER_EXPR:
        return this.translateArrayFilterExpression(t);
      case n.ARRAY_INDEX_FILTER_EXPR:
        return this.translateArrayIndexFilterExpression(t);
      case n.RANGE_FILTER_EXPR:
        return this.translateRangeFilterExpression(t);
      default:
        return "";
    }
  }
  translateArrayFilterExpression(t) {
    return this.translateExpression(t.filter);
  }
  translateRangeFilterExpression(t) {
    const e = [];
    return e.push("["), t.fromIdx && e.push(this.translateExpression(t.fromIdx)), e.push(":"), t.toIdx && e.push(this.translateExpression(t.toIdx)), e.push("]"), e.join("");
  }
  translateArrayIndexFilterExpression(t) {
    return this.translateExpression(t.indexes);
  }
  translateObjectIndexFilterExpression(t) {
    const e = [];
    return e.push("{"), t.exclude && e.push("!"), e.push(this.translateExpression(t.indexes)), e.push("}"), e.join("");
  }
  translateSelectorExpression(t) {
    const e = [];
    return e.push(t.selector), t.prop && (t.prop.type === p.STR ? e.push(g(t.prop.value)) : e.push(t.prop.value)), e.join("");
  }
  translateWithWrapper(t, e, r) {
    return `${e}${this.translateExpression(t)}${r}`;
  }
  translateObjectFilterExpression(t) {
    var e;
    return t.filter.type === n.ALL_FILTER_EXPR ? "[*]" : ((e = this.options) == null ? void 0 : e.defaultPathType) === d.JSON ? this.translateWithWrapper(t.filter, "[?(", ")]") : this.translateWithWrapper(t.filter, "{", "}");
  }
  translateLambdaArgExpression(t) {
    return `?${t.index}`;
  }
  translateLoopControlExpression(t) {
    return t.control;
  }
  translateLoopExpression(t) {
    const e = [];
    return e.push("for"), e.push("("), t.init && e.push(this.translateExpression(t.init)), e.push(";"), t.test && e.push(this.translateExpression(t.test)), e.push(";"), t.update && e.push(this.translateExpression(t.update)), e.push(")"), e.push("{"), e.push(this.translateExpression(t.body)), e.push("}"), e.join(" ");
  }
  translateReturnExpression(t) {
    return `return ${this.translateExpression(t.value || X)};`;
  }
  translateThrowExpression(t) {
    return `throw ${this.translateExpression(t.value)}`;
  }
  translateExpressions(t, e, r = "") {
    return t.map((s) => `${r}${this.translateExpression(s)}`).join(e);
  }
  translateLambdaFunctionExpression(t) {
    return `lambda ${this.translateExpression(t.body)}`;
  }
  translateRegularFunctionExpression(t) {
    const e = [];
    return e.push("function"), e.push("("), t.params && t.params.length > 0 && e.push(t.params.join(", ")), e.push(")"), e.push("{"), e.push(this.translateExpression(t.body)), e.push("}"), e.join(" ");
  }
  translateFunctionExpression(t) {
    if (t.block)
      return this.translateExpression(t.body.statements[0]);
    const e = [];
    return t.async && e.push("async"), t.lambda ? e.push(this.translateLambdaFunctionExpression(t)) : e.push(this.translateRegularFunctionExpression(t)), e.join(" ");
  }
  translateFunctionCallExpression(t) {
    const e = [];
    return t.object ? (e.push(this.translateExpression(t.object)), t.id && e.push(`.${t.id}`)) : t.parent ? (e.push(this.translatePathRootString(t.parent, d.SIMPLE)), t.id && e.push(`.${t.id}`)) : t.id && e.push(t.id.replace(O, "$")), e.push("("), t.args && e.push(this.translateExpressions(t.args, ", ")), e.push(")"), e.join("");
  }
  translateAssignmentExpression(t) {
    const e = [];
    return e.push(this.translatePathExpression(t.path)), e.push(t.op), e.push(this.translateExpression(t.value)), e.join(" ");
  }
  translateDefinitionExpression(t) {
    const e = [];
    return e.push(t.definition), t.fromObject && e.push("{ "), e.push(t.vars.join(", ")), t.fromObject && e.push(" }"), e.push(" = "), e.push(this.translateExpression(t.value)), e.join(" ");
  }
  translateConditionalExpressionBody(t) {
    return t.type === n.STATEMENTS_EXPR ? this.translateWithWrapper(t, "{", "}") : this.translateExpression(t);
  }
  translateConditionalExpression(t) {
    const e = [];
    return e.push(this.translateExpression(t.if)), e.push(" ? "), e.push(this.translateConditionalExpressionBody(t.then)), t.else && (e.push(" : "), e.push(this.translateConditionalExpressionBody(t.else))), e.join("");
  }
  translatePathType(t) {
    switch (t) {
      case d.JSON:
        return "~j ";
      case d.RICH:
        return "~r ";
      case d.SIMPLE:
        return "~s ";
      default:
        return "";
    }
  }
  translatePathRootString(t, e) {
    return t === O ? "$" : t === I ? e === d.JSON ? "$" : "^" : t;
  }
  translatePathRoot(t, e) {
    if (typeof t.root == "string")
      return this.translatePathRootString(t.root, e);
    if (t.root) {
      const r = [];
      return r.push(this.translateExpression(t.root)), t.root.type === n.PATH && r.push(".(). "), r.join("");
    }
    return e === d.JSON ? "@. " : ". ";
  }
  translatePathOptions(t) {
    if (!t)
      return "";
    const e = [];
    return t.item && (e.push("@"), e.push(t.item)), t.index && (e.push("#"), e.push(t.index)), t.toArray && e.push("[]"), e.join("");
  }
  translatePathParts(t) {
    const e = [];
    t.length > 0 && t[0].type !== n.SELECTOR && t[0].type !== n.BLOCK_EXPR && e.push(".");
    for (const r of t)
      r.type === n.BLOCK_EXPR && e.push("."), e.push(this.translateExpression(r)), e.push(this.translatePathOptions(r.options));
    return e.join("");
  }
  translatePathExpression(t) {
    const e = [];
    return e.push(this.translatePathType(t.pathType)), e.push(this.translatePathRoot(t, t.inferredPathType)), e.push(this.translatePathOptions(t.options)), e.push(this.translatePathParts(t.parts)), t.returnAsArray && e.push("[]"), e.join("");
  }
  translateIncrementExpression(t) {
    return t.postfix ? `${t.id}${t.op}` : `${t.op}${t.id}`;
  }
  translateUnaryExpression(t) {
    return `${t.op} ${this.translateExpression(t.arg)}`;
  }
  translateBlockExpression(t) {
    const e = [];
    return e.push("("), e.push(this.translateExpressions(t.statements, ";")), e.push(")"), e.join("");
  }
  translateSpreadExpression(t) {
    return `...${this.translateExpression(t.value)}`;
  }
  getIndentation() {
    return " ".repeat(this.level * rt);
  }
  translateObjectExpression(t) {
    const e = [];
    return e.push("{"), this.level++, e.push(this.translateExpressions(t.props, ",", `
${this.getIndentation()}`)), this.level--, e.push(`
${this.getIndentation()}}`), e.join("");
  }
  translateObjectPropExpression(t) {
    const e = [];
    return t.contextVar && e.push(`@${t.contextVar} `), t.key && (typeof t.key == "string" ? e.push(g(t.key)) : e.push(this.translateWithWrapper(t.key, "[", "]")), e.push(": ")), e.push(this.translateExpression(t.value)), e.join("");
  }
  translateArrayExpression(t) {
    const e = [];
    return e.push("["), e.push(this.translateExpressions(t.elements, ", ")), e.push("]"), e.join("");
  }
  translateLiteralExpression(t) {
    return W(t.tokenType, t.value);
  }
  translateStatementsExpression(t) {
    return this.translateExpressions(t.statements, `;
`);
  }
  translateBinaryExpression(t) {
    const e = this.translateExpression(t.args[0]), r = this.translateExpression(t.args[1]);
    return `${e} ${t.op} ${r}`;
  }
}
class gt extends Error {
}
function w(i, t) {
  return `(typeof ${i} === 'string' && ${i}.startsWith(${t}))`;
}
function j(i, t) {
  const e = [];
  return e.push(`(typeof ${i} === 'string' && `), e.push(`typeof ${t} === 'string' && `), e.push(`${i}.toLowerCase().startsWith(${t}.toLowerCase()))`), e.join("");
}
function V(i, t) {
  return `(typeof ${i} === 'string' && ${i}.endsWith(${t}))`;
}
function D(i, t) {
  const e = [];
  return e.push(`(typeof ${i} === 'string' && `), e.push(`typeof ${t} === 'string' && `), e.push(`${i}.toLowerCase().endsWith(${t}.toLowerCase()))`), e.join("");
}
function Nt(i, t) {
  return `((typeof ${i} === 'string' || Array.isArray(${i})) && ${i}.includes(${t}))`;
}
function B(i, t) {
  const e = [];
  return e.push(`(typeof ${i} === 'string' && typeof ${t} === 'string') ?`), e.push(`(${i}.toLowerCase().includes(${t}.toLowerCase()))`), e.push(":"), e.push(`(Array.isArray(${i}) && (${i}.includes(${t})`), e.push(`|| (typeof ${t} === 'string' && ${i}.includes(${t}.toLowerCase()))))`), e.join("");
}
const $t = {
  "===": (i, t) => `${i}===${t}`,
  "==": (i, t) => {
    const e = [];
    return e.push(`((typeof ${i} == 'string' && `), e.push(`typeof ${t} == 'string' && `), e.push(`${i}.toLowerCase() == ${t}.toLowerCase()) || `), e.push(`${i} == ${t})`), e.join("");
  },
  ">=": (i, t) => `${i}>=${t}`,
  ">": (i, t) => `${i}>${t}`,
  "<=": (i, t) => `${i}<=${t}`,
  "<": (i, t) => `${i}<${t}`,
  "!==": (i, t) => `${i}!==${t}`,
  "!=": (i, t) => {
    const e = [];
    return e.push(`(typeof ${i} == 'string' && typeof ${t} == 'string') ?`), e.push(`(${i}.toLowerCase() != ${t}.toLowerCase())`), e.push(":"), e.push(`(${i} != ${t})`), e.join("");
  },
  "^==": w,
  "==^": (i, t) => w(t, i),
  "^=": j,
  "=^": (i, t) => j(t, i),
  "$==": V,
  "==$": (i, t) => V(t, i),
  "$=": D,
  "=$": (i, t) => D(t, i),
  "=~": (i, t) => `(${t} instanceof RegExp) ? (${t}.test(${i})) : (${i}==${t})`,
  contains: B,
  "==*": (i, t) => Nt(i, t),
  "=*": (i, t) => B(i, t),
  size: (i, t) => `${i}.length === ${t}`,
  empty: (i, t) => `(${i}.length === 0) === ${t}`,
  subsetof: (i, t) => `${i}.every((el) => {return ${t}.includes(el);})`,
  anyof: (i, t) => `${i}.some((el) => {return ${t}.includes(el);})`,
  "+": (i, t) => `${i}+${t}`,
  "-": (i, t) => `${i}-${t}`,
  "*": (i, t) => `${i}*${t}`,
  "/": (i, t) => `${i}/${t}`,
  "%": (i, t) => `${i}%${t}`,
  ">>": (i, t) => `${i}>>${t}`,
  "<<": (i, t) => `${i}<<${t}`,
  "**": (i, t) => `${i}**${t}`
};
function z(i = "") {
  return `function ${i}sum(arr) { 
    if(!Array.isArray(arr)) {
      throw new Error('Expected an array');
    }
    return arr.reduce((a, b) => a + b, 0); 
  }`;
}
function U(i = "") {
  return `function ${i}avg(arr) { 
    if(!Array.isArray(arr)) {
      throw new Error('Expected an array');
    }
    ${z()}
    return sum(arr) / arr.length; 
  }`;
}
const Q = {
  sum: z(A),
  max: `function ${A}max(arr) { 
    if(!Array.isArray(arr)) {
      throw new Error('Expected an array');
    }
    return Math.max(...arr); 
  }`,
  min: `function ${A}min(arr) { 
    if(!Array.isArray(arr)) {
      throw new Error('Expected an array');
    }
    return Math.min(...arr); 
  }`,
  avg: U(A),
  length: `function ${A}length(arr) {
    if(!Array.isArray(arr) && typeof arr !== 'string') {
      throw new Error('Expected an array or string');
    }
     return arr.length; 
    }`,
  stddev: `function ${A}stddev(arr) {
    if(!Array.isArray(arr)) {
      throw new Error('Expected an array');
    }
    ${U()}
    const mu = avg(arr);
    const diffSq = arr.map((el) => (el - mu) ** 2);
    return Math.sqrt(avg(diffSq));
  }`,
  first: `function ${A}first(arr) { 
    if(!Array.isArray(arr)) {
      throw new Error('Expected an array');
    }
    return arr[0]; 
  }`,
  last: `function ${A}last(arr) { 
    if(!Array.isArray(arr)) {
      throw new Error('Expected an array');
    }
    return arr[arr.length - 1]; 
  }`,
  index: `function ${A}index(arr, i) { 
    if(!Array.isArray(arr)) {
      throw new Error('Expected an array');
    }
    if (i < 0) {
      return arr[arr.length + i];
    }
    return arr[i];
   }`,
  keys: `function ${A}keys(obj) { return Object.keys(obj); }`
};
function _t(i) {
  return Object.prototype.hasOwnProperty.call(Q, i);
}
class u {
  constructor(t) {
    this.vars = [], this.lastVarId = 0, this.unusedVars = [], this.standardFunctions = {}, this.expr = t;
  }
  init() {
    this.vars = [], this.lastVarId = 0, this.unusedVars = [];
  }
  acquireVar() {
    if (this.unusedVars.length)
      return this.unusedVars.shift();
    const t = `${A}${++this.lastVarId}`;
    return this.vars.push(t), t;
  }
  acquireVars(t = 1) {
    const e = [];
    for (let r = 0; r < t; r++)
      e.push(this.acquireVar());
    return e;
  }
  releaseVars(...t) {
    let e = t.length;
    for (; e--; )
      this.unusedVars.push(t[e]);
  }
  translate(t = tt, e = I) {
    this.init();
    const r = [], s = this.translateExpr(this.expr, t, e), a = Object.values(this.standardFunctions);
    return a.length > 0 && r.push(a.join("").replace(/\s+/g, " ")), r.push(`let ${t};`), r.push(this.vars.map((h) => `let ${h};`).join("")), r.push(s), r.push(`
      if (!Array.isArray(${t})) {
        ${t} = [${t}];
      }
    `), r.push(`return ${t};`), r.join("");
  }
  translateExpr(t, e, r) {
    switch (t.type) {
      case n.STATEMENTS_EXPR:
        return this.translateStatementsExpr(t, e, r);
      case n.PATH:
        return this.translatePathExpr(t, e, r);
      case n.IN_EXPR:
        return this.translateINExpr(t, e, r);
      case n.COMPARISON_EXPR:
      case n.MATH_EXPR:
        return this.translateBinaryExpr(t, e, r);
      case n.LOGICAL_COALESCE_EXPR:
      case n.LOGICAL_AND_EXPR:
      case n.LOGICAL_OR_EXPR:
        return this.translateLogicalExpr(t, e, r);
      case n.UNARY_EXPR:
        return this.translateUnaryExpr(t, e, r);
      case n.LAMBDA_ARG:
        return this.translateLambdaArgExpr(t, e, r);
      case n.SPREAD_EXPR:
        return this.translateSpreadExpr(t, e, r);
      case n.INCREMENT:
        return this.translateIncrementExpr(t, e, r);
      case n.LITERAL:
        return this.translateLiteralExpr(t, e, r);
      case n.ARRAY_EXPR:
        return this.translateArrayExpr(t, e, r);
      case n.OBJECT_EXPR:
        return this.translateObjectExpr(t, e, r);
      case n.BLOCK_EXPR:
        return this.translateBlockExpr(t, e, r);
      case n.LOOP_EXPR:
        return this.translateLoopExpr(t, e, r);
      case n.LOOP_CONTROL_EXPR:
        return this.translateLoopControlExpr(t, e, r);
      case n.FUNCTION_EXPR:
        return this.translateFunctionExpr(t, e, r);
      case n.FUNCTION_CALL_EXPR:
        return this.translateFunctionCallExpr(t, e, r);
      case n.DEFINITION_EXPR:
        return this.translateDefinitionExpr(t, e, r);
      case n.ASSIGNMENT_EXPR:
        return this.translateAssignmentExpr(t, e, r);
      case n.OBJECT_FILTER_EXPR:
        return this.translateObjectFilterExpr(t, e, r);
      case n.ARRAY_FILTER_EXPR:
        return this.translateArrayFilterExpr(t, e, r);
      case n.OBJECT_INDEX_FILTER_EXPR:
        return this.translateIndexFilterExpr(t, e, r);
      case n.SELECTOR:
        return this.translateSelector(t, e, r);
      case n.CONDITIONAL_EXPR:
        return this.translateConditionalExpr(t, e, r);
      case n.RETURN_EXPR:
        return this.translateReturnExpr(t, e, r);
      case n.THROW_EXPR:
        return this.translateThrowExpr(t, e, r);
      default:
        return "";
    }
  }
  translateLoopControlExpr(t, e, r) {
    return `${t.control};`;
  }
  translateIncrementExpr(t, e, r) {
    const s = [];
    let a = `${t.op}${t.id};`;
    return t.postfix && (a = `${t.id}${t.op};`), s.push(u.generateAssignmentCode(e, a)), s.join("");
  }
  translateLoopExpr(t, e, r) {
    const s = [], a = this.acquireVar(), h = this.acquireVar(), o = this.acquireVar(), c = this.acquireVar(), E = this.acquireVar();
    return t.init && s.push(this.translateExpr(t.init, a, r)), s.push(`for(let ${E}=0;;${E}++){`), t.update && (s.push(`if(${E} > 0) {`), s.push(this.translateExpr(t.update, o, r)), s.push("}")), t.test && (s.push(this.translateExpr(t.test, h, r)), s.push(`if(!${h}){break;}`)), s.push(this.translateExpr(t.body, c, r)), s.push("}"), u.generateAssignmentCode(e, c), this.releaseVars(E, c, o, h, a), s.join("");
  }
  translateThrowExpr(t, e, r) {
    const s = [], a = this.acquireVar();
    return s.push(this.translateExpr(t.value, a, r)), s.push(`throw ${a};`), this.releaseVars(a), s.join("");
  }
  translateReturnExpr(t, e, r) {
    const s = [];
    if (t.value) {
      const a = this.acquireVar();
      s.push(this.translateExpr(t.value, a, r)), s.push(`return ${a};`), this.releaseVars(a);
    }
    return s.push("return;"), s.join("");
  }
  translateConditionalExpr(t, e, r) {
    const s = [], a = this.acquireVar();
    return s.push(this.translateExpr(t.if, a, r)), s.push(`if(${a}){`), s.push(this.translateExpr(t.then, e, r)), s.push("} else {"), t.else ? s.push(this.translateExpr(t.else, e, r)) : s.push(`${e} = undefined;`), s.push("}"), this.releaseVars(a), s.join("");
  }
  translateLambdaArgExpr(t, e, r) {
    return `${e} = args[${t.index}];`;
  }
  translateSpreadExpr(t, e, r) {
    return this.translateExpr(t.value, e, r);
  }
  translatePathRoot(t, e, r) {
    return typeof t.root == "object" ? this.translateExpr(t.root, e, r) : `${e} = ${t.root || r};`;
  }
  translatePathContextVariables(t, e, r, s) {
    const a = u.getPathOptions(t, e), h = [];
    return a.item && h.push(`let ${a.item} = ${r};`), a.index && h.push(`let ${a.index} = ${s};`), h.join("");
  }
  prepareDataForPathPart(t, e, r) {
    const s = [];
    return s.push(u.covertToArrayValue(r)), (u.isArrayFilterExpr(t.parts[e]) || u.isAllFilterExpr(t.parts[e]) || u.isToArray(t, e)) && s.push(`${r} = [${r}];`), s.join("");
  }
  static isAllFilterExpr(t) {
    return t.type === n.OBJECT_FILTER_EXPR && t.filter.type === n.ALL_FILTER_EXPR;
  }
  translatePathParts(t, e) {
    const { parts: r } = t, s = [], a = r.length, h = this.acquireVars(a), o = this.acquireVars(a), c = this.acquireVars(a), E = this.acquireVar();
    s.push(u.generateAssignmentCode(E, "[]")), s.push(u.generateAssignmentCode(h[0], e));
    for (let P = 0; P < a; P++) {
      const Z = r[P], _ = o[P], C = c[P], F = h[P];
      s.push(this.prepareDataForPathPart(t, P, F)), s.push(`for(${_}=0; ${_}<${F}.length; ${_}++) {`), s.push(`${C} = ${F}[${_}];`), s.push(this.translatePathContextVariables(t, P, C, _)), s.push(this.translateExpr(Z, C, C)), s.push(`if(${u.returnIsEmpty(C)}) { continue; }`), P < a - 1 ? s.push(u.generateAssignmentCode(h[P + 1], C)) : s.push(`${E}.push(${C});`);
    }
    for (let P = 0; P < a; P++)
      s.push("}");
    return this.releaseVars(...o), this.releaseVars(...c), this.releaseVars(...h), this.releaseVars(E), t.returnAsArray || s.push(u.convertToSingleValueIfSafe(E)), s.push(u.generateAssignmentCode(e, E)), s.join("");
  }
  translateSimplePathExpr(t, e, r) {
    const s = [];
    let a = r;
    typeof t.root == "object" ? (s.push(this.translateExpr(t.root, e, r)), a = e) : t.root && (a = t.root);
    const h = this.translateToSimplePath(t, s, a);
    return s.push(u.generateAssignmentCode(e, h)), t.returnAsArray && s.push(u.covertToArrayValue(e)), s.join("");
  }
  translatePathExpr(t, e, r) {
    if (t.inferredPathType === d.SIMPLE)
      return this.translateSimplePathExpr(t, e, r);
    const s = [];
    return s.push(this.translatePathRoot(t, e, r)), t.parts.length > 0 ? s.push(this.translatePathParts(t, e)) : t.returnAsArray && s.push(u.covertToArrayValue(e)), s.join("");
  }
  translateCurrentSelector(t, e, r) {
    var h;
    const s = [], a = (h = t.prop) == null ? void 0 : h.value;
    if (a === "*") {
      const o = u.returnObjectValues(r);
      s.push(`${e} = ${o}.flat();`);
    } else if (a) {
      const o = g(a);
      s.push(`if(${r} && Object.prototype.hasOwnProperty.call(${r}, ${o})){`), s.push(`${e}=${r}[${o}];`), s.push("} else {"), s.push(`${e} = undefined;`), s.push("}");
    }
    return s.join("");
  }
  translateSelector(t, e, r) {
    return t.selector === "." ? this.translateCurrentSelector(t, e, r) : this.translateDescendantSelector(t, e, r);
  }
  translateDescendantSelector(t, e, r) {
    const s = [], a = this.acquireVar(), h = this.acquireVar(), o = this.acquireVar();
    s.push(u.generateAssignmentCode(o, "[]"));
    const { prop: c } = t, E = g(c == null ? void 0 : c.value);
    s.push(`${a}=[${r}];`), s.push(`while(${a}.length > 0) {`), s.push(`${h} = ${a}.shift();`), s.push(`if(${u.returnIsEmpty(h)}){continue;}`), s.push(`if(Array.isArray(${h})){`), s.push(`${a} = ${a}.concat(${h});`), s.push("continue;"), s.push("}"), s.push(`if(typeof ${h} === "object") {`);
    const P = u.returnObjectValues(h);
    return s.push(`${a} = ${a}.concat(${P});`), c && ((c == null ? void 0 : c.value) === "*" ? s.push(`${o} = ${o}.concat(${P});`) : (s.push(`if(Object.prototype.hasOwnProperty.call(${h}, ${E})){`), s.push(`${o} = ${o}.concat(${h}[${E}]);`), s.push("}"))), s.push("}"), c || s.push(`${o}.push(${h});`), s.push("}"), s.push(`${e} = ${o}.flat();`), s.join("");
  }
  translateBlockExpr(t, e, r) {
    if (t.statements.length === 1)
      return this.translateExpr(t.statements[0], e, r);
    const s = {
      type: n.FUNCTION_EXPR,
      body: S(...t.statements),
      block: !0
    };
    return this.translateExpr(s, e, r);
  }
  translateFunctionExpr(t, e, r) {
    const s = [], a = t.async ? "async function" : "function";
    s.push(e, "=", a, "(", (t.params || []).join(","), "){");
    const h = new u(t.body);
    return s.push(h.translate(et, r)), s.push("}"), t.block && s.push("()"), s.push(";"), s.join("");
  }
  getFunctionName(t, e) {
    return t.object ? t.id ? `${e}.${t.id}` : e : t.parent ? t.id ? `${t.parent}.${t.id}` : t.parent : t.id;
  }
  translateFunctionCallExpr(t, e, r) {
    const s = [], a = this.acquireVar();
    s.push(u.generateAssignmentCode(a, r)), t.object && (s.push(this.translateExpr(t.object, a, r)), s.push(`if(${u.returnIsNotEmpty(a)}){`));
    const h = this.translateSpreadableExpressions(t.args, a, s), o = this.getFunctionName(t, a);
    return t.id && _t(t.id) ? (this.standardFunctions[t.id] = Q[t.id], s.push(`if(${o} && typeof ${o} === 'function'){`), s.push(a, "=", o, "(", h, ");"), s.push("} else {"), s.push(
      a,
      "=",
      A,
      t.id,
      "(",
      t.parent ?? a,
      ",",
      h,
      ");"
    ), s.push("}")) : s.push(a, "=", o, "(", h, ");"), t.object && s.push("}"), s.push(u.generateAssignmentCode(e, a)), this.releaseVars(a), s.join("");
  }
  translateObjectContextProp(t, e, r, s = []) {
    const a = [];
    a.push(u.generateAssignmentCode(e, "{}"));
    const h = this.acquireVar(), o = this.acquireVar();
    return s.push(h, o), a.push(`for(let [${A}key, ${A}value] of Object.entries(${r})){`), a.push(
      u.generateAssignmentCode(
        t.contextVar,
        `{key:${A}key,value:${A}value}`
      )
    ), a.push(this.translateExpr(t.key, h, r)), a.push(this.translateExpr(t.value, o, r)), a.push(`${e}[${h}] = ${o};`), a.push("}"), a.join("");
  }
  translateObjectExpr(t, e, r) {
    const s = [], a = [], h = [];
    for (const o of t.props) {
      const c = [];
      if (o.contextVar) {
        const E = this.acquireVar();
        s.push(this.translateObjectContextProp(o, E, r)), a.push(`...${E}`);
      } else {
        if (o.key) {
          if (typeof o.key != "string") {
            const P = this.acquireVar();
            s.push(this.translateExpr(o.key, P, r)), c.push(`[${P}]`), h.push(P);
          } else
            c.push(g(o.key));
          c.push(":");
        }
        const E = this.acquireVar();
        s.push(this.translateExpr(o.value, E, r)), o.value.type === n.SPREAD_EXPR && c.push("..."), c.push(E), a.push(c.join("")), h.push(E);
      }
    }
    return s.push(u.generateAssignmentCode(e, `{${a.join(",")}}`)), this.releaseVars(...h), s.join("");
  }
  translateSpreadableExpressions(t, e, r) {
    const s = [], a = [];
    for (const h of t) {
      const o = this.acquireVar();
      r.push(this.translateExpr(h, o, e)), a.push(h.type === n.SPREAD_EXPR ? `...${o}` : o), s.push(o);
    }
    return this.releaseVars(...s), a.join(",");
  }
  translateArrayExpr(t, e, r) {
    const s = [], a = this.translateSpreadableExpressions(t.elements, r, s);
    return s.push(`${e} = [${a}];`), s.join("");
  }
  translateLiteralExpr(t, e, r) {
    const s = W(t.tokenType, t.value);
    return u.generateAssignmentCode(e, s);
  }
  getSimplePathSelector(t, e) {
    var r, s, a;
    return ((r = t.prop) == null ? void 0 : r.type) === p.STR ? `${e ? "" : "?."}[${g((s = t.prop) == null ? void 0 : s.value)}]` : `${e ? "" : "?"}.${(a = t.prop) == null ? void 0 : a.value}`;
  }
  getSimplePathArrayIndex(t, e, r, s, a) {
    const h = [], o = a ? "" : "?.", c = t.filter, E = this.acquireVar();
    return r.push(this.translateExpr(c.indexes.elements[0], E, e)), h.push(`${o}[${E}]`), s.push(E), h.join("");
  }
  translateToSimplePath(t, e, r, s = !1) {
    const a = [];
    a.push(r);
    const h = [];
    for (const o of t.parts)
      o.type === n.SELECTOR ? a.push(this.getSimplePathSelector(o, s)) : a.push(
        this.getSimplePathArrayIndex(
          o,
          r,
          e,
          h,
          s
        )
      );
    return this.releaseVars(...h), a.join("");
  }
  translateAssignmentExpr(t, e, r) {
    const s = [], a = this.acquireVar();
    s.push(this.translateExpr(t.value, a, r));
    const h = this.translateToSimplePath(
      t.path,
      s,
      t.path.root,
      !0
    );
    return u.ValidateAssignmentPath(h), s.push(u.generateAssignmentCode(h, a, t.op)), this.releaseVars(a), s.join("");
  }
  translateDefinitionVars(t) {
    const e = [t.vars.join(",")];
    return t.fromObject && (e.unshift("{"), e.push("}")), e.join("");
  }
  translateDefinitionExpr(t, e, r) {
    const s = [], a = this.acquireVar();
    s.push(this.translateExpr(t.value, a, r));
    const h = this.translateDefinitionVars(t);
    return s.push(`${t.definition} ${h}=${a};`), s.push(u.generateAssignmentCode(e, a)), this.releaseVars(a), s.join("");
  }
  translateStatementsExpr(t, e, r) {
    return this.translateStatements(t.statements, e, r);
  }
  translateStatements(t, e, r) {
    return t.map((s) => this.translateExpr(s, e, r)).join("");
  }
  getLogicalConditionCode(t, e) {
    switch (t) {
      case n.LOGICAL_COALESCE_EXPR:
        return `${e} !== null && ${e} !== undefined`;
      case n.LOGICAL_OR_EXPR:
        return e;
      default:
        return `!${e}`;
    }
  }
  translateLogicalExpr(t, e, r) {
    const s = this.acquireVar(), a = [];
    a.push(this.translateExpr(t.args[0], s, r));
    const h = this.getLogicalConditionCode(t.type, s);
    a.push(`if(${h}) {`), a.push(u.generateAssignmentCode(e, s)), a.push("} else {");
    const o = this.acquireVar();
    return a.push(this.translateExpr(t.args[1], o, r)), a.push(u.generateAssignmentCode(e, o)), a.push("}"), this.releaseVars(s, o), a.join("");
  }
  translateINExpr(t, e, r) {
    const s = [], a = this.acquireVar(), h = this.acquireVar(), o = this.acquireVar();
    s.push(this.translateExpr(t.args[0], a, r)), s.push(this.translateExpr(t.args[1], h, r)), s.push(`if(typeof ${h} === 'object'){`);
    const c = `(Array.isArray(${h}) ? ${h}.includes(${a}) : ${a} in ${h})`;
    return s.push(u.generateAssignmentCode(o, c)), s.push("} else {"), s.push(u.generateAssignmentCode(o, "false")), s.push("}"), s.push(u.generateAssignmentCode(e, o)), s.join("");
  }
  translateUnaryExpr(t, e, r) {
    const s = [], a = this.acquireVar();
    return s.push(this.translateExpr(t.arg, a, r)), s.push(`${e} = ${t.op} ${a};`), this.releaseVars(a), s.join("");
  }
  translateArrayFilterExpr(t, e, r) {
    const s = [];
    return t.filter.type === n.ARRAY_INDEX_FILTER_EXPR ? s.push(this.translateIndexFilterExpr(t.filter, e, r)) : t.filter.type === n.RANGE_FILTER_EXPR && s.push(this.translateRangeFilterExpr(t.filter, e, r)), s.join("");
  }
  translateObjectFilterExpr(t, e, r) {
    const s = [];
    if (t.filter.type !== n.ALL_FILTER_EXPR) {
      const a = this.acquireVar();
      s.push(u.generateAssignmentCode(a, "true")), s.push(this.translateExpr(t.filter, a, r)), s.push(`if(!${a}) {${e} = undefined;}`), this.releaseVars(a);
    }
    return s.join("");
  }
  translateObjectIndexFilterExpr(t, e, r, s) {
    const a = [];
    return s && a.push(`${e}=Object.keys(${t}).filter(key => !${e}.includes(key));`), a.push(u.generateAssignmentCode(r, "{}")), a.push(`for(let key of ${e}){`), a.push(
      `if(Object.prototype.hasOwnProperty.call(${t}, key)){${r}[key] = ${t}[key];}`
    ), a.push("}"), a.join("");
  }
  translateArrayIndexFilterExpr(t, e, r) {
    const s = [];
    return s.push(u.generateAssignmentCode(r, "[]")), s.push(`for(let key of ${e}){`), s.push("if(typeof key === 'string'){"), s.push(`for(let childCtx of ${t}){`), s.push("if(Object.prototype.hasOwnProperty.call(childCtx, key)){"), s.push(`${r}.push(childCtx[key]);`), s.push("}"), s.push("}"), s.push("} else {"), s.push(`if(key < 0){key = ${t}.length + key;}`), s.push(`if(Object.prototype.hasOwnProperty.call(${t}, key)){`), s.push(`${r}.push(${t}[key]);`), s.push("}"), s.push("}"), s.push("}"), s.push(`if(${e}.length === 1) {${r} = ${r}[0];}`), s.join("");
  }
  translateIndexFilterExpr(t, e, r) {
    const s = [], a = this.acquireVar();
    s.push(this.translateArrayExpr(t.indexes, a, r)), s.push(`${a} = ${a}.flat();`);
    const h = this.acquireVar();
    return t.type === n.OBJECT_INDEX_FILTER_EXPR ? s.push(this.translateObjectIndexFilterExpr(r, a, h, t.exclude)) : s.push(this.translateArrayIndexFilterExpr(r, a, h)), s.push(u.generateAssignmentCode(e, h)), this.releaseVars(a), this.releaseVars(h), s.join("");
  }
  translateRangeFilterExpr(t, e, r) {
    const s = [], a = this.acquireVar(), h = this.acquireVar();
    return t.fromIdx ? t.toIdx ? (s.push(this.translateExpr(t.fromIdx, a, r)), s.push(this.translateExpr(t.toIdx, h, r)), s.push(e, "=", r, ".slice(", a, ",", h, ");")) : (s.push(this.translateExpr(t.fromIdx, a, r)), s.push(e, "=", r, ".slice(", a, ");")) : t.toIdx && (s.push(this.translateExpr(t.toIdx, h, r)), s.push(e, "=", r, ".slice(0,", h, ");")), this.releaseVars(a, h), s.join("");
  }
  translateBinaryExpr(t, e, r) {
    const s = this.acquireVar(), a = this.acquireVar(), { args: h } = t, o = [];
    return o.push(this.translateExpr(h[0], s, r)), o.push(this.translateExpr(h[1], a, r)), o.push(e, "=", $t[t.op](s, a), ";"), this.releaseVars(s, a), o.join("");
  }
  static ValidateAssignmentPath(t) {
    if (t.startsWith(O) && !t.startsWith(J))
      throw new gt(`Invalid assignment path at${t}`);
  }
  static getPathOptions(t, e) {
    var r;
    return (e === 0 ? t.options : (r = t.parts[e - 1]) == null ? void 0 : r.options) || {};
  }
  static isToArray(t, e) {
    return this.getPathOptions(t, e).toArray === !0;
  }
  static isArrayFilterExpr(t) {
    return t.type === n.ARRAY_FILTER_EXPR;
  }
  static returnIsEmpty(t) {
    return `${t} === null || ${t} === undefined`;
  }
  static returnIsNotEmpty(t) {
    return `${t} !== null && ${t} !== undefined`;
  }
  static returnObjectValues(t) {
    return `Object.values(${t}).filter(v => v !== null && v !== undefined)`;
  }
  static convertToSingleValueIfSafe(t) {
    return `${t} = ${t}.length < 2 ? ${t}[0] : ${t};`;
  }
  static covertToArrayValue(t) {
    const e = [];
    return e.push(`if(${u.returnIsNotEmpty(t)}){`), e.push(`${t} = Array.isArray(${t}) ? ${t} : [${t}];`), e.push("}"), e.join("");
  }
  static generateAssignmentCode(t, e, r = "=") {
    return `${t}${r}${e};`;
  }
}
class x {
  constructor(t) {
    this.fn = t;
  }
  static compileAsSync(t, e) {
    return Function(
      I,
      O,
      x.translate(t, e)
    );
  }
  static compileAsAsync(t, e) {
    return st(
      I,
      O,
      x.translate(t, e)
    );
  }
  static translateExpression(t) {
    return new u(t).translate();
  }
  static isValidJSONPath(t = "") {
    var e;
    try {
      const s = (e = x.parse(t, { defaultPathType: d.JSON }).statements) == null ? void 0 : e[0];
      return s && s.type === n.PATH && (!s.root || s.root === I);
    } catch {
      return !1;
    }
  }
  static prepareMappings(t) {
    return t.map((e) => ({
      ...e,
      input: e.input ?? e.from,
      output: e.output ?? e.to
    }));
  }
  static validateMappings(t, e) {
    x.prepareMappings(t).forEach((r) => {
      if (!x.isValidJSONPath(r.input) || !x.isValidJSONPath(r.output))
        throw new $(
          "Invalid mapping: invalid JSON path",
          r.input,
          r.output
        );
    }), x.parseMappingPaths(t, e);
  }
  static createFlatMappingsAST(t, e) {
    const r = { ...e, mappings: !0 };
    return x.prepareMappings(t).filter((s) => s.input && s.output).map((s) => ({
      ...s,
      inputExpr: x.parse(s.input, r).statements[0],
      outputExpr: x.parse(s.output, r).statements[0]
    }));
  }
  static parseMappingPaths(t, e) {
    return Ot(x.createFlatMappingsAST(t, e));
  }
  static create(t, e) {
    return new x(x.compileAsAsync(t, e));
  }
  static createAsSync(t, e) {
    return new x(x.compileAsSync(t, e));
  }
  static parse(t, e) {
    if (!t)
      return X;
    if (it(t))
      return t;
    if (typeof t == "string") {
      const r = new y(t);
      return new R(r, e).parse();
    }
    return x.parseMappingPaths(t, e);
  }
  static translate(t, e) {
    return x.translateExpression(x.parse(t, e));
  }
  static reverseTranslate(t, e) {
    const r = new Ct(e);
    let s = t;
    return Array.isArray(t) && (s = x.parseMappingPaths(t, e)), r.translate(s);
  }
  static convertMappingsToTemplate(t, e) {
    return x.reverseTranslate(
      x.parse(t, e),
      e
    );
  }
  static evaluateAsSync(t, e = {}, r = {}, s = {}) {
    return x.createAsSync(t, e).evaluate(r, s);
  }
  static evaluate(t, e = {}, r = {}, s = {}) {
    return x.create(t, e).evaluate(r, s);
  }
  evaluate(t = {}, e = {}) {
    return this.fn(t, e);
  }
}
export {
  J as BINDINGS_CONTEXT_KEY,
  O as BINDINGS_PARAM_KEY,
  st as CreateAsyncFunction,
  I as DATA_PARAM_KEY,
  X as EMPTY_EXPR,
  et as FUNCTION_RESULT_KEY,
  rt as INDENTATION_SPACES,
  x as JsonTemplateEngine,
  y as JsonTemplateLexer,
  M as JsonTemplateLexerError,
  R as JsonTemplateParser,
  m as JsonTemplateParserError,
  u as JsonTemplateTranslator,
  gt as JsonTemplateTranslatorError,
  f as Keyword,
  l as OperatorType,
  d as PathType,
  tt as RESULT_KEY,
  n as SyntaxType,
  p as TokenType,
  A as VARS_PREFIX,
  $t as binaryOperators,
  Ot as convertToObjectMapping,
  S as convertToStatementsExpr,
  v as createBlockExpression,
  g as escapeStr,
  N as getLastElement,
  it as isExpression,
  _t as isStandardFunction,
  Q as standardFunctions,
  b as toArray
};
