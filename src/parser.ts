import { BinaryTokenType, Token, TokenType } from "./lexer";

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

const VARIABLE_DECLARATION_KEYWORD = 'MAKE'

export enum ASTNodeType {
  Program = 'Program',
  ProcedureCall = 'ProcedureCall',
  NumberLiteral = "NumberLiteral",
  StringLiteral = "StringLiteral",
  InfixOperation = "InfixOperation",
  Variable = "Variable",
  Assignment = "Assignment",
  // ProcedureDefinition = 'ProcedureDefinition',
}


export type ASTNode = {
  type: ASTNodeType;
  value?: string | number | ASTNode;
}

export type ASTProgramNode = ASTNode & {
  program: ASTNode[];
}

export type ASTInfixNode = ASTNode & {
  left: ASTNode,
  right: ASTNode
}

type ASTAssignmentNode = ASTNode & {
  name: string;
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
  tokens: Token[];
  currentToken: Token;
  tokenCount: number;
  index = 0;



  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.currentToken = this.tokens[this.index];
    this.tokenCount = tokens.length;
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

  parseString = (): ASTNode => ({
    type: ASTNodeType.StringLiteral,
    value: this.currentToken.value
  })

  parseVariable = (): ASTNode => ({
    type: ASTNodeType.Variable,
    value: this.currentToken.value
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

  parseVariableAssignment = (): ASTAssignmentNode => {
    this.advance();
    if (this.currentToken.type !== TokenType.STRING) {
      throw new Error('Variable name must be a quote-prefixed word.')
    }
    const varName = this.currentToken.value as string;
    this.advance()
    const varDef = this.parseExpression();
    return {
      type: ASTNodeType.Assignment,
      name: varName,
      value: varDef
    }
  }

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

    this.advance()
    while (this.currentToken.type !== TokenType.NEWLINE && this.currentToken.type !== TokenType.EOF) {
      args.push(this.parseExpression())
      this.advance()
    }
    // TODO: deal with weird comma syntax in logo - I think they CAN be used but arent usually
    return {
      type: ASTNodeType.ProcedureCall,
      value: token.value,
      args
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
      case TokenType.PROCEDURE:
        // // THIS ISN'T ACTUALLY REALLY CORRECT AS BOTH THE NAME AND VALUE CAN BE PROCEDURE CALLS!!
        // // oh boy
        // if (/make/i.test(this.currentToken.value as string)) {
        //   left = this.parseVariableAssignment();
        //   break;
        // }
        left = this.parseProcedureCall();
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


  // parseStatement = (): ASTNode => {
  //   // TODO: assignment expression
  //   return this.parseBinary()
  // }

  parse = (): ASTProgramNode => {
    const program: ASTNode[] = [];

    while (this.currentToken.type !== TokenType.EOF) {
      program.push(this.parseExpression());
      this.advance();
    }

    return {
      type: ASTNodeType.Program,
      program: program
    }
  }
}
