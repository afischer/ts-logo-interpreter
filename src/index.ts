import {readFileSync} from 'fs';
import { Environment, evaluate } from './interpreter';
import lex from './lexer';
import Parser from './parser';

const [_node, _path, filename] = process.argv;

if (!filename) {
  console.error('No filename passed, this will eventually open the repl');
  process.exit(0)
}


// Todo: check for file existing
const file = readFileSync(filename, 'utf-8');

const env = new Environment();
const parser = new Parser();


const lexed = lex(file);

const ast = parser.parse(lexed);

console.log('Parsed AST:')
console.log(JSON.stringify(ast, null, 2))


evaluate(ast, env);

