import * as readline from 'readline';
import lex from "../src/lexer";
import Parser from "../src/parser_old";


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const run = () => {
  rl.question('logo > ', (input) => {
    try {
      const lexed = lex(input);
      console.log('Lexed tokens:')
      console.log(lexed);

      console.log('Parsed AST:')
      // const parser = new Parser(lexed);

      // const ast = parser.parse();
      // console.log(ast)
      run()
    } catch (error) {
      console.error(error)
      run();
    }
  })
}
run()
