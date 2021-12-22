import { BinaryTokenType, Token, TokenType } from "./lexer";
import { procedureArgCounts } from "./stdlib";

const getPrecedence = (type: TokenType) => {
  switch (type) {
    case TokenType.LT:
    case TokenType.GT:
    case TokenType.LEQ:
    case TokenType.GEQ:
    case TokenType.EQL:
      return 7;
    case TokenType.PLUS:
    case TokenType.MINUS:
      return 10;
    case TokenType.MULTIPLY:
    case TokenType.DIVIDE:
      return 20;
    default:
      // non-binary type so return -1
      return -1
    // throw new Error('Non-binary token type passed to get precedence!')
  }
}

export enum ASTNodeType {
  Program = 'Program',
  ProcedureCall = 'ProcedureCall',
  ProcedureDefinition = 'ProcedureDefinition',
  NumberLiteral = "NumberLiteral",
  StringLiteral = "StringLiteral",
  Boolean = "Boolean",
  InfixOperation = "InfixOperation",
  Variable = "Variable",
  Assignment = "Assignment",
  List = "List",
}


export type ASTNode = {
  type: ASTNodeType;
  value?: string | number | boolean | ASTNode | ASTNode[];
}

export type ASTProgramNode = ASTNode & {
  program: ASTNode[];
}

export type ASTInfixNode = ASTNode & {
  left: ASTNode,
  right: ASTNode
}

export type ASTProcedureDefNode = ASTNode & {
  vars: ASTNode[]
  body: ASTProgramNode;
}

export type ASTProcedureNode = ASTNode & {
  args: ASTNode[]
}

const InfixOperators = new Set([
  TokenType.PLUS,
  TokenType.MINUS,
  TokenType.MULTIPLY,
  TokenType.DIVIDE,
  TokenType.EQL,
  TokenType.NEQ,
  TokenType.LEQ,
  TokenType.GEQ,
  TokenType.LT,
  TokenType.GT,
])

export default class Parser {
  tokens: Token[] = [];
  currentToken: Token;
  index = 0;

  // start with stdlib procedureArgCounts, all defined procedures will be added
  procedureArgCounts: Map<string, number> = procedureArgCounts;

  get tokenCount() {
    return this.tokens.length
  }

  constructor() {
    this.currentToken = this.tokens[this.index];
  }

  advance = () => {
    this.index += 1;
    if (this.index < this.tokenCount) {
      this.currentToken = this.tokens[this.index];
    }
  }

  peek = () => {
    return this.tokens[this.index + 1]
  }

  parseInfix = (left: ASTNode): ASTInfixNode => {
    console.log('parsing infix, current is', this.currentToken);

    const curr = this.currentToken;
    const prec = getPrecedence(this.currentToken.type);
    this.advance();

    const right = this.parseExpression(prec);

    return {
      type: ASTNodeType.InfixOperation,
      value: curr.type,
      left,
      right,
    }
  }

  parseNumber = (): ASTNode => ({
    type: ASTNodeType.NumberLiteral,
    value: this.currentToken.value
  })

  parseBoolean = (): ASTNode => ({
    type: ASTNodeType.Boolean,
    // we may need to retain case so this might be done in the interpreter
    value: /^true$/i.test(this.currentToken.value as string)
  })

  parseString = (): ASTNode => ({
    type: ASTNodeType.StringLiteral,
    // strip off leading "
    value: (this.currentToken.value as string).substring(1)
  })

  parseVariable = (): ASTNode => ({
    type: ASTNodeType.Variable,
    // strip off leading :
    value: (this.currentToken.value as string).substring(1)
  })

  parseGroup = (): ASTNode => {
    // advance past the lparen
    this.advance();
    const expr = this.parseExpression();
    if (this.peek().type !== TokenType.RPAREN) {
      throw new Error('Missing closing parentheses on expression')
    }
    this.advance()
    return expr;
  }

  parseList = (): ASTNode => {
    this.advance();
    const items: ASTNode[] = [];
    while (this.currentToken.type !== TokenType.RBRACKET) {
      if (this.currentToken.type === TokenType.EOF) {
        throw new Error('Missing closing bracket on list')
      } else if (this.currentToken.type === TokenType.LBRACKET) {
        items.push(this.parseList())
        this.advance()
      } else {
        // treat all items in a list as if they were a word
        items.push({
          type: ASTNodeType.StringLiteral,
          value: this.currentToken.value
        })
        this.advance();
      }
    }

    return {
      type: ASTNodeType.List,
      value: items
    }
  }

  // ok actually we need to modify this as it should only use as many args as it
  // needs during the interpretation phase, except for if it's in a group, in
  // which case it should take all the args within the group
  parseProcedureCall = (): ASTProcedureNode => {
    const token = this.currentToken;
    const args: ASTNode[] = [];

    // check if this is the end of the procedure's arguments
    const nextType = this.peek().type
    if (nextType === TokenType.NEWLINE || nextType === TokenType.EOF) {
      this.advance();
      return {
        type: ASTNodeType.ProcedureCall,
        value: token.value,
        args
      }
    }


    // otherwise pull args:
    const argCount = this.procedureArgCounts.get(token.value as string)
    while (
      args.length !== argCount &&
      this.currentToken.type !== TokenType.NEWLINE &&
      this.currentToken.type !== TokenType.EOF
    ) {
      this.advance()
      args.push(this.parseExpression())
    }

    // TODO: deal with weird comma syntax in logo - I think they CAN be used but arent usually
    return {
      type: ASTNodeType.ProcedureCall,
      value: token.value,
      args
    }
  }

  parseProcedureDefinition = (): ASTProcedureDefNode => {
    this.advance();
    const procedureToken = this.currentToken;
    if (procedureToken.type !== TokenType.PROCEDURE) {
      throw new Error(`Expected procedure name, got ${this.currentToken.type} ${this.currentToken.value}`)
    }

    const vars: ASTNode[] = [];
    const body: ASTNode[] = [];
    this.advance();
    // TODO: Optional args, REST args, default number
    while (this.currentToken.type === TokenType.VARIABLE) {
      vars.push(this.parseExpression())
      if (this.currentToken.type === TokenType.VARIABLE) this.advance();
    }

    let finishedParsing = false;
    while (!finishedParsing) {
      if (this.currentToken.type !== TokenType.PROCEDURE) {
        finishedParsing = /^end$/i.test(this.currentToken.value as string)
        break;
      }

      body.push(this.parseExpression())
      this.advance();
    }

    // set arg count for parsing calls
    this.procedureArgCounts.set(procedureToken.value as string, vars.length);
console.log('>>>>> PROCEDURE ARG COUNTS', this.procedureArgCounts)
    return {
      type: ASTNodeType.ProcedureDefinition,
      value: procedureToken.value,
      vars,
      body: {
        type: ASTNodeType.Program,
        program: body
      }
    }
  }

  parseExpression = (precedence = 0): ASTNode => {
    console.log('parsing expression, current is', this.currentToken);

    let left: ASTNode;

    switch (this.currentToken.type) {
      case TokenType.NUMBER:
        left = this.parseNumber()
        break;
      case TokenType.STRING:
        left = this.parseString()
        break;
      case TokenType.VARIABLE:
        left = this.parseVariable()
        break;
      case TokenType.LPAREN:
        left = this.parseGroup()
        break;
      case TokenType.LBRACKET:
        left = this.parseList()
        break;
      case TokenType.PROCEDURE:
        if (`${this.currentToken.value}`.toLowerCase() === "to") {
          left = this.parseProcedureDefinition();
          break;
        }
        if (/^(true|false)$/i.test(this.currentToken.value as string)) {
          left = this.parseBoolean();
          break;
        }
        // variable assignment is just a special primitive procedure, "make"
        left = this.parseProcedureCall();
        break;

      case TokenType.NEWLINE:
        break;

      default:
        throw new Error(`Unsupported node type ${this.currentToken.type}`)
    }

    while (precedence < getPrecedence((this.peek() || {}).type)) {
      // parse infix expression
      if (InfixOperators.has(this.peek().type)) {
        // TODO: parse calls
        this.advance();
        left = this.parseInfix(left);
      } else {
        return left;
      }
    }
    return left;
  }


  program: ASTNode[] = [];

  parse = (tokens: Token[]): ASTProgramNode => {
    // this.tokens.push(...tokens);
    // console.log('current index is', this.index)
    // this.currentToken = this.tokens[this.index];
    this.program = []; // this might be dangerous when parsing files?? maybe??
    this.tokens = tokens;
    this.index = 0;
    this.currentToken = this.tokens[this.index];

    while (this.currentToken.type !== TokenType.EOF) {
      this.program.push(this.parseExpression());
      this.advance();
    }

    return {
      type: ASTNodeType.Program,
      program: this.program
    }
  }
}
