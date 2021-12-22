import * as readline from 'readline';
import interpret, { evaluate, Environment } from '../src/interpreter';
import lex from "../src/lexer";
import Parser from "../src/parser";


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getLine(query: string) {
  return new Promise(resolve => rl.question(query, ans => {
    resolve(ans);
  }))
}


const getFullInput = async (endWord: string) => {
  let lastLine = await getLine('----- ');
  let full = lastLine;
  while (lastLine !== endWord) {
    lastLine = await getLine('----- ');
    full += '\n' + lastLine;
  }

  return full;
}

const replEnv = new Environment();
const parser = new Parser();

const run = () => {

  rl.question('logo > ', async (input) => {
    try {
      if (input.startsWith('to')) {
        input += " " + await getFullInput('end')
      }

      const lexed = lex(input);
      console.log('Lexed tokens:')
      console.log(lexed);

      console.log('Parsed AST:')

      const ast = parser.parse(lexed);
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
