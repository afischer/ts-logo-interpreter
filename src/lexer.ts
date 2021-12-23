export enum TokenType {
  NUMBER = 'NUMBER',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  RPAREN = 'RPAREN',
  LPAREN = 'LPAREN',
  RBRACKET = 'RBRACKET',
  LBRACKET = 'LBRACKET',
  RBRACE = 'RBRACE',
  LBRACE = 'LBRACE',
  NEWLINE = 'NEWLINE',
  SEMICOLON = 'SEMICOLON',
  BOOLEAN = 'BOOLEAN',
  // string literals are prefixed with a single quotation mark
  STRING = 'STRING',
  // in Logo, variables are prefixed with a colon, making them easy for the lexer to parse out
  VARIABLE = 'VARIABLE',
  // a non-numeric word typed without punctuation represents a request to invoke the procedure named by that word
  PROCEDURE = 'PROCEDURE',
  EQL = 'EQL',
  NEQ = 'NEQ',
  LEQ = 'LEQ',
  GEQ = 'GEQ',
  LT = 'LT',
  GT = 'GT',
  EOF = 'EOF'
}

// TODO handle weird list tokenization with brackets

export type BinaryTokenType = TokenType.PLUS | TokenType.MINUS | TokenType.MULTIPLY | TokenType.DIVIDE;

export type Token = {
  type: TokenType;
  value?: string | number;
}

// for keeping track of where we are in the file
type Position = {
  row: number;
  col: number;
  index: number;
}

/**
 * Tokenization in Logo has some quirks, some of which make it difficult to parse, some of which
 * make it easier! TK add stuff on why that is and some documentation.
 */
export default function lex(input: string): Token[] {
  // break up into tokenizer and lexer?
  const tokens: Token[] = [];

  const inputLen = input.length;
  const pos: Position = { row: 1, col: 1, index: 0 };
  let currentChar = input[pos.index];

  const advance = () => {
    pos.index += 1;
    pos.col += 1;
    currentChar = input[pos.index]
  };

  const peek = () => {
    return input[pos.index + 1]
  }

  const advanceLine = () => {
    while (currentChar !== '\n') {
      advance();
    }
  }

  /**
   * Continues running through a number to fetch entire thing
   */
  const tokenizeNumber = (): Token => {
    let isFloat = false;
    let numString = '';

    // while this is possibly a number, parse
    while (/\d|\./.test(currentChar)) {
      if (currentChar === '.') {
        if (isFloat) {
          throw new Error('Invalid number - multiple decimals found')
        }
        isFloat = true;
      }
      numString += currentChar
      advance();
    }

    return { type: TokenType.NUMBER, value: isFloat ? parseFloat(numString) : parseInt(numString) };
  }

  const tokenizeWord = (): Token => {
    const type = currentChar === '"'
      ? TokenType.STRING
      : currentChar === ':'
        ? TokenType.VARIABLE
        : TokenType.PROCEDURE;

    // allow parser to strip off colon, quote
    let value = currentChar; // type === TokenType.PROCEDURE ? currentChar : '';
    advance();

    while (currentChar && /\w|\.|\?|'|\\/.test(currentChar)) {
      // if current character is a backslash, advance and take the next char verbatim
      // NB: this seems wrong
      if (currentChar === '\\') {
        advance()
      }
      value += currentChar;
      advance()
    }

    return { type, value }
  }

  // TODO: p6 A line(an instruction line or one read by READLIST or READWORD) can be continued onto the following line if its last character is a tilde(~)
  while (pos.index !== inputLen) {
    process.stdout.write(currentChar);
    if (currentChar === '\n') {
      // keep track of newlines
      pos.row += 1;
      pos.col = 0;
      tokens.push({ type: TokenType.NEWLINE })
      advance();
    } else if (/\s/.test(currentChar)) {
      advance();
    } else if (currentChar === '~') {
      // advance past this character and the newline
      advanceLine();
      // TODO: maybe need to advance one more to get past the \n?
    } else if (currentChar === '+') {
      tokens.push({ type: TokenType.PLUS, value: currentChar })
      advance();
      // TODO: deal with negative numbers
    } else if (currentChar === '-') {
      tokens.push({ type: TokenType.MINUS, value: currentChar })
      advance();
    } else if (currentChar === '*') {
      tokens.push({ type: TokenType.MULTIPLY, value: currentChar })
      advance();
    } else if (currentChar === '/') {
      tokens.push({ type: TokenType.DIVIDE, value: currentChar })
      advance();
    } else if (currentChar === '(') {
      tokens.push({ type: TokenType.LPAREN, value: currentChar })
      advance();
    } else if (currentChar === ')') {
      tokens.push({ type: TokenType.RPAREN, value: currentChar })
      advance();
    } else if (currentChar === '[') {
      tokens.push({ type: TokenType.LBRACKET, value: currentChar })
      advance();
    } else if (currentChar === ']') {
      tokens.push({ type: TokenType.RBRACKET, value: currentChar })
      advance();
    } else if (currentChar === '{') {
      tokens.push({ type: TokenType.LBRACE, value: currentChar })
      advance();
    } else if (currentChar === '}') {
      tokens.push({ type: TokenType.RBRACE, value: currentChar })
      advance();
    } else if (currentChar === ';') {
      tokens.push({ type: TokenType.SEMICOLON })
      advanceLine();
    } else if (currentChar === '<') { // comparitors
      if (peek() === '>') {
        tokens.push({ type: TokenType.NEQ, value: '<>' })
        advance(); // extra advance
      } else if (peek() === '=') {
        tokens.push({ type: TokenType.LEQ, value: '<=' })
        advance(); // extra advance
      } else {
        tokens.push({ type: TokenType.LT, value: currentChar })
      }
      advance();
    } else if (currentChar === '>') {
      if (peek() === '=') {
        tokens.push({ type: TokenType.GEQ, value: '>=' })
        advance(); // extra advance
      } else {
        tokens.push({ type: TokenType.GT, value: currentChar })
      }
      advance();
    } else if (currentChar === '=') {
      tokens.push({ type: TokenType.EQL, value: currentChar })
      advance();
    } else if (/\d|\./.test(currentChar)) { // numbers
      tokens.push(tokenizeNumber())
    } else if (/"|:|\?|\w|'|\\/.test(currentChar)) { // words
      tokens.push(tokenizeWord())
    } else {
      throw new Error(`Error on line ${pos.row}:${pos.col}\nUnknown token ${currentChar}`)
    }
  }


  tokens.push({ type: TokenType.EOF })
  return tokens;
}
