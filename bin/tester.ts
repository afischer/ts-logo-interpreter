import lex from "../src/lexer";
import Parser from "../src/parser";

// const input = `
// PRINT 2 + 2
// PRINT 1 + 2 * 3
// PRINT (1 + 2) * 3
// PRINT FIRST "hi

// `;

// const input = `2 + 2.3 + 324 ; foobabr basz
// 2 + 4 + 6`

const input = "1 + 2 + 3";

const lexed = lex(input);
console.log(lexed);

const parser = new Parser(lexed);

const ast = parser.parse();
console.log(ast)
