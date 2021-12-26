import { readFileSync } from 'fs';
import * as path from 'path';

import { Environment, evaluate } from "../interpreter";
import lex from '../lexer';
import Parser, { ASTNodeType } from "../parser";
import StdlibInterface from "./StdlibInterface";
import { checkInputs, unimplemented } from "./util";

type Procedures =
"make"
| 'thing'
| "end"
| "load"


export default class WorkspaceManagementPrimitives implements StdlibInterface<Procedures> {
  env: Environment;
  constructor(env: Environment) {
    this.env = env;
  }

  static procedureArgCounts: Record<Procedures, number> = {
    make: 2,
    thing: 1,
    end: 0,
    load: 1,
  }

  procedureDefs = {
    make: (...args: any[]) => {
      checkInputs('make', 2, args)
      this.env.set(args[0], args[1]);
    },
    thing: (...args: any[]) => {
      checkInputs('thing', 1, args, 'string')
      return this.env.get(args[0])
    },
    end: () => {},
    load: (...args: any[]) => {
      // todo: support the directory hadling stuff
      const filepath = path.join(__dirname, '../../test/logo/ucblogoSuite', args[0]);
      const data = readFileSync(filepath, 'utf-8');
      console.log(data);
      const lexed = lex(data)
      const parsed = new Parser().parse(lexed)
      evaluate(parsed, this.env);

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
