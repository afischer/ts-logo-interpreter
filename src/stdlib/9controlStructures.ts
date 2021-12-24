import { Environment, evaluate } from "../interpreter";
import lex from "../lexer";
import Parser, { ASTNode, ASTNodeType } from "../parser";
import StdlibInterface from "./StdlibInterface";
import { checkInputs, unimplemented } from "./util";

type Procedures =
"run"
| "repeat"
| "if"
| "ifelse"
| "foreach"
| 'output'

type ConditionalFuncArgs = {
  condition: boolean,
  thenDo: ASTNode,
  elseDo: ASTNode
}
export default class ControlStructurePrimitives implements StdlibInterface<Procedures> {
  env: Environment;
  constructor(env: Environment) {
    this.env = env;
  }

  static procedureArgCounts: Record<Procedures, number> = {
    run: 1,
    repeat: 2,
    if: -1, // this is a special case, but need to make the compiler happy
    ifelse: -1, // this is a special case, but need to make the compiler happy
    foreach: 2,
    output: 1
  }

  // pull this out as it's likely to be reused a number of times in these
  // control structures as many take instructionlists as args.
  run = (...args: any[]) => {
      // all values in a list are stored as a string, so parse and run them
      const parser = new Parser();
      const lexed = lex(args[0].join(' '))
      const parsed = parser.parse(lexed);
      evaluate(parsed, this.env);
    }

  procedureDefs = {
    run: this.run,
    repeat: (...args: any[]) => {
      const repeatCount = args[0];
      const instructionList = args[1]
      Array.from({length: repeatCount}, () => this.run(instructionList))
    },

    if: ({condition, thenDo}: ConditionalFuncArgs) => {
      if (condition) {
        this.run((thenDo.value as ASTNode[]).map(x => x.value))
      }
    },

    ifelse: ({condition, thenDo, elseDo}: ConditionalFuncArgs) => {
      if (condition) {
        this.run((thenDo.value as ASTNode[]).map(x => x.value))
      } else {
        this.run((elseDo.value as ASTNode[]).map(x => x.value))
      }
    },

    // TODO: deal with ?REST
    foreach: (...args: any[]) => {
      const data = args[0];
      const template = args[1];

      // if data is a string, split into characters, otherwise just use array
      [...data].forEach((val, i) => {
        // replace ? with val, # with index
        const toRun = template.map((x: string) =>  {
          // double escape strings/vars as they should print with " or :
          if (x === '?') return /^"(|:)/.test(val) ? `"${val}` : val
          if (x === '#') return i
          return x;
        })

        this.run(toRun)
      })
    },

    output: (...args: any[]) => {
      return args[0]
    }
  }


  aliases = {}

  registerPrimitives = () => {
    Object.entries(this.procedureDefs).forEach(([name, func]) => {
      this.env.defineProcedure(name, func);
    })

    Object.entries(this.aliases).forEach(([alias, funcName]) => {
      const func = this.procedureDefs[funcName as Procedures]
      this.env.defineProcedure(alias, func);
    })
  }
}
