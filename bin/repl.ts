import * as readline from 'readline';
import interpret, { evaluate, Environment } from '../src/interpreter';
import lex from "../src/lexer";
import Parser from "../src/parser";


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const replEnv = new Environment();

const run = () => {

  rl.question('logo > ', (input) => {
    try {
      const lexed = lex(input);
      console.log('Lexed tokens:')
      console.log(lexed);

      console.log('Parsed AST:')
      const parser = new Parser(lexed);

      const ast = parser.parse();
      console.log(JSON.stringify(ast, null, 2))

      evaluate(ast, replEnv);
      run()
    } catch (error) {
      console.error(error)
      run();
    }
  })
}
run()
