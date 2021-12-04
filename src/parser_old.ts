import { BinaryTokenType, Token, TokenType } from "./lexer";

enum ASTNodeType {
  BinaryExpression = 'BinaryExpression',
  UnaryOperation = 'UnaryOperation',
  Number = "Number",
  String = "String",
}


type ASTNode = {
  type: ASTNodeType;
  value?: string | number;
  operator?: TokenType; //BinaryTokenType
  left?: ASTNode;
  right?: ASTNode;
  node?: ASTNode;
}

const factorOps = new Set([TokenType.MULTIPLY, TokenType.DIVIDE])
const expressionOps = new Set([TokenType.PLUS, TokenType.MINUS])

// build out an absbtract syntax tree

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

  binaryOperator = (func: () => ASTNode, operations: Set<TokenType>): ASTNode => {
    let left = func();

    while (operations.has(this.currentToken.type)) {
      const operatorToken = this.currentToken; // needed?
      const right = func();
      this.advance()
      left = {
        type: ASTNodeType.BinaryExpression,
        operator: operatorToken.type as BinaryTokenType,
        left,
        right
      }
    }
    return left;
  }

  factor = (): ASTNode => {
    const currentType = this.currentToken.type;
    switch (currentType) {
      case TokenType.PLUS:
      case TokenType.MINUS:
        const type = this.currentToken.type;
        this.advance();
        const factor = this.factor()
        return { type: ASTNodeType.UnaryOperation, operator: type, node: factor };

      case TokenType.NUMBER:
        const value = this.currentToken.value;
        this.advance();
        return { type: ASTNodeType.Number, value }

      case TokenType.LPAREN:
        this.advance();
        const expr = this.expression();
        if (this.currentToken.type === TokenType.RPAREN) {
          this.advance();
          return expr;
        } else {
          throw new Error(`Expected, ")", got ${JSON.stringify(this.currentToken)}`);
        }

      // case TokenType.
      default:
        throw new Error(`Unknown token ${JSON.stringify(this.currentToken)}`);
    }
  }

  term = (): ASTNode => {
    return this.binaryOperator(this.factor, factorOps)
  }

  /**
   * expression: term ((PLUS | MINUS) term)
   * term      : factor ((MULTIPLY | DIVIDE) term)
   * factor    : INTEGER | LPAREN expression RPAREN
   */
  expression = () => {
    return this.binaryOperator(this.term, expressionOps)
  }

  parse = () => {
    return this.expression();
  }
}
