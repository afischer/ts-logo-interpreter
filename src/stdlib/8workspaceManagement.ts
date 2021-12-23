import { Environment } from "../interpreter";
import { ASTNodeType } from "../parser";
import StdlibInterface from "./StdlibInterface";
import { checkInputs, unimplemented } from "./util";

type Procedures =
"make"
| 'thing'
| "end"


export default class WorkspaceManagementPrimitives implements StdlibInterface<Procedures> {
  env: Environment;
  constructor(env: Environment) {
    this.env = env;
  }

  static procedureArgCounts: Record<Procedures, number> = {
    make: 2,
    thing: 1,
    end: 0,
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
    end: () => {}
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
