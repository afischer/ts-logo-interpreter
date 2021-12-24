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
  Conditional = "Conditional",
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

export type ASTConditionalNode = ASTNode & {
  condition: ASTNode;
  then: ASTNode;
  else: ASTNode;
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
    // groups in logo act like a lisp, not like a standard grouping. The first
    // entry is considered to be a function call, the remainder its args. It is
    // up to the interpreter to decide whether the number of args is valid.
    const node: ASTProcedureNode = {
      type: ASTNodeType.ProcedureCall,
      value: this.currentToken.value,
      args: []
    }

    // advance past procedure name
    this.advance();

    while (this.currentToken.type !== TokenType.RPAREN) {
      node.args.push(this.parseExpression())
      this.advance();
    }

    return node;
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
        if (this.currentToken.value) {
          items.push({
            type: ASTNodeType.StringLiteral,
            value: this.currentToken.value
          })
        }
        this.advance();
      }
    }

    // this.advance();
    console.log('Finished parsing list', items, 'at', this.currentToken);

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
    const argCount = this.procedureArgCounts.get(`${token.value}`.toLowerCase())
    if (!argCount) {
      throw new Error(`I don't know how to ${token.value}`);
    }

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
    console.log('>>>>>>>>>>> HI');

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

    console.log('>>>>>>>>>>> GOT vars', vars);

    // set arg count for parsing calls. Must be set here so body can recursively
    // call the funciton.
    this.procedureArgCounts.set(procedureToken.value as string, vars.length);

    let finishedParsing = false;
    while (!finishedParsing) {
      console.log('>>>>>>>>> IN PROC BODY PARSING', this.currentToken);

      // if (this.currentToken.type === TokenType.PROCEDURE) {
      //   finishedParsing = /^end$/i.test(this.currentToken.value as string)
      //   break;
      // }

      body.push(this.parseExpression())
      this.advance();
      finishedParsing = /^end$/i.test(this.currentToken.value as string)
    }

    console.log('FINISHED PARSING PROCEDURE', procedureToken.value, vars, body);


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

  parseConditional = (): ASTConditionalNode => {
    let condition: ASTNode;
    let thenDo: ASTNode;
    let elseDo: ASTNode;

    const ifelseKeyword = `${this.currentToken.value}`.toLowerCase();
    // advance past keyword
    this.advance();

    if (ifelseKeyword === 'ifelse') {
      condition = this.parseExpression();
      this.advance()
      thenDo = this.parseExpression();
      console.log('then is', thenDo);
      this.advance()
      elseDo = this.parseExpression();
      console.log('else is', elseDo);

    } else if (ifelseKeyword === 'if') {
      condition = this.parseExpression();
      this.advance()
      thenDo = this.parseExpression();
    }
    return {
      type: ASTNodeType.Conditional,
      value: ifelseKeyword,
      condition,
      then: thenDo,
      else: elseDo
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
        if (/^(if(else)?)$/i.test(this.currentToken.value as string)) {
          left = this.parseConditional();
          console.log('hi')
          break;
        }
        // variable assignment is just a special primitive procedure, "make"
        left = this.parseProcedureCall();
        break;

      case TokenType.NEWLINE:
      case TokenType.SEMICOLON:
        break;

      default:
        throw new Error(`Unsupported node type ${this.currentToken.type}`)
    }

    while (precedence < getPrecedence((this.peek() || {}).type)) {
      // parse infix expression
      if (InfixOperators.has(this.peek().type)) {
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
      const nextExp = this.parseExpression();
      // TODO: deal with newlines, comments better
      if (nextExp !== undefined) this.program.push(nextExp);
      this.advance();
    }

    return {
      type: ASTNodeType.Program,
      program: this.program
    }
  }
}
