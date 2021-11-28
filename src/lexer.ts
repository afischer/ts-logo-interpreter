const KEYWORDS = new Set([
  // 2.1 Constructors
  "WORD", // concats words
  "LIST", // outputs a list of inputs
  "SENTENCE", "SE", // flat list of inputs (i.e. flattens arrays)
  "FPUT",

  "PRINT",
  "FIRST",
  "MAKE",  // set a variable
  "THING", // gets value of variable, also :var

])

enum TokenType {
  NUMBER = 'NUMBER',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  RPAREN = 'RPAREN',
  LPAREN = 'LPAREN',
  NEWLINE = 'NEWLINE',
  SEMICOLON = 'SEMICOLON',
  // string literals are prefixed with a single quotation mark
  LITERAL = 'LITERAL',
  // in Logo, variables are prefixed with a colon, making them easy for the lexer to parse out
  VARIABLE = 'VARIABLE',
  // a non-numeric word typed without punctuation represents a request to invoke the procedure named by that word
  PROCEDURE = 'PROCEDURE',
}

type Token = {
  type: TokenType;
  value?: string | number;
}

// for keeping track of where we are in the file
type Position = {
  row: number;
  col: number;
  index: number;
}

export default function lex(input: string): Token[] {
  const tokens: Token[] = [];

  const inputLen = input.length;
  const pos: Position = { row: 1, col: 1, index: 0 };
  let currentChar = input[pos.index];

  const advance = () => {
    pos.index += 1;
    pos.col += 1;
    currentChar = input[pos.index]
  };

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
      ? TokenType.LITERAL
      : currentChar === ':'
        ? TokenType.VARIABLE
        : TokenType.PROCEDURE;

    // only use first char if it's a procedure
    let value = type === TokenType.PROCEDURE ? currentChar : '';
    advance();

    while (/\w|\./.test(currentChar)) {
      value += currentChar;
      advance()
    }

    return { type, value }
  }

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
    } else if (currentChar === '+') {
      tokens.push({ type: TokenType.PLUS })
      advance();
    } else if (currentChar === '-') {
      tokens.push({ type: TokenType.MINUS })
      advance();
    } else if (currentChar === '*') {
      tokens.push({ type: TokenType.MULTIPLY })
      advance();
    } else if (currentChar === '/') {
      tokens.push({ type: TokenType.DIVIDE })
      advance();
    } else if (currentChar === '(') {
      tokens.push({ type: TokenType.LPAREN })
      advance();
    } else if (currentChar === ')') {
      tokens.push({ type: TokenType.RPAREN })
      advance();
    } else if (currentChar === ';') {
      tokens.push({ type: TokenType.SEMICOLON })
      advanceLine();
      // TODO: logic for geq, leq, gt, lt
    } else if (/\d|\./.test(currentChar)) { // numbers
      tokens.push(tokenizeNumber())
    } else if (/"|:|\w/.test(currentChar)) { // words
      tokens.push(tokenizeWord())
    } else {
      throw new Error(`Error on line ${pos.row}:${pos.col}\nUnknown token ${currentChar}`)
    }
  }


  // tokens.push({ type: 'EOF', value: '<EOF>' })
  return tokens;
}
