import { Environment } from "../interpreter";
import StdlibInterface from "./StdlibInterface";
import { checkInputs, unimplemented } from "./util";

type Procedures =
 'and'
| 'or'
| 'not'

/** 6 Logical Operators */
export default class LogicalPrimitives implements StdlibInterface<Procedures> {
  env: Environment;
  constructor(env: Environment) {
    this.env = env;
  }

  static procedureArgCounts: Record<Procedures, number> =  {
    and: 2,
    or: 2,
    not: 1,
  };

  procedureDefs = {
    and: (...args: any[]) => {
      return args.reduce((acc, curr) => {
        acc = acc && curr
        return acc;
      });
    },
    or: (...args: any[]) => {
      return args.reduce((acc, curr) => {
        acc = acc || curr
        return acc;
      });
    },
    not: (...args: any[]) => {
      checkInputs('not', 1, args, 'boolean')
      return !args[0];
    }
  }

  aliases: {}

  registerPrimitives = () => {
    Object.entries(this.procedureDefs).forEach(([name, func]) => {
      this.env.defineProcedure(name, func);
    })
  }
}
