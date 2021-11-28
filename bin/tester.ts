import lex from "../src/lexer";

const input = `
PRINT 2 + 2
PRINT 1 + 2 * 3
PRINT (1 + 2) * 3
PRINT FIRST "hi

`;

// const input = `2 + 2.3 + 324 ; foobabr basz
// 2 + 4 + 6`

console.log(lex(input));
