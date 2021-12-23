import { Environment, evaluate } from "../interpreter";
import lex from "../lexer";
import Parser, { ASTNodeType } from "../parser";
import StdlibInterface from "./StdlibInterface";
import { checkInputs, unimplemented } from "./util";

type Procedures =
"run"
| "repeat"


export default class ControlStructurePrimitives implements StdlibInterface<Procedures> {
  env: Environment;
  constructor(env: Environment) {
    this.env = env;
  }

  static procedureArgCounts: Record<Procedures, number> = {
    run: 1,
    repeat: 2
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
