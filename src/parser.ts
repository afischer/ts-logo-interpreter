import { BinaryTokenType, Token, TokenType } from "./lexer";

enum ASTNodeType {
  Program = 'Program',
  ProcedureDefinition = 'ProcedureDefinition',
  ProcedureCall = 'ProcedureCall',
  NumberLiteral = "NumberLiteral",
  StringLiteral = "StringLiteral",
}


type ASTNode = {
  type: ASTNodeType;
  value?: string | number;
}

type ASTProgramNode = ASTNode & {
  program: ASTNode[];
}


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


  parseExpression = (): ASTNode => {
    return {
      type: ASTNodeType.NumberLiteral
    }
  }

  parseProcedureDefinition = (): ASTNode => {
    const node = {
      type: ASTNodeType.ProcedureDefinition,
      value: this.currentToken.value,
      args: this.parseExpression()
    }
    this.advance()
    return node;
  }

  parse = (): ASTProgramNode => {
    const program: ASTNode[] = [];
    while (this.index < this.tokenCount) {
      program.push(this.parseExpression())
    }
    return {
      type: ASTNodeType.Program,
      program: program
    }
  }
}
