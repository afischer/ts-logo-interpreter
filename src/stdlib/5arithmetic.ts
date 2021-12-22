import { Environment } from "../interpreter";
import StdlibInterface from "./StdlibInterface";
import { checkInputs, unimplemented } from "./util";

type Procedures =
 'bitand'
| 'bitor'
| 'bitxor'
| 'bitnot'
| 'ashift'
| 'lshift'

/** 4 Arithmetic */
export default class ArithmeticPrimitives implements StdlibInterface<Procedures> {
  env: Environment;
  constructor(env: Environment) {
    this.env = env;
  }

  static procedureArgCounts: Record<Procedures, number> =  {
    bitand: 2,
    bitor: 2,
    bitxor: 2,
    bitnot: 1,
    ashift: 2,
    lshift: 2,
  };

  procedureDefs = {
    // 5.5 Bitwise Operations
    bitand: (...args: any[]) => {
      return args.reduce((acc, curr) => {
        acc = acc & curr
        return acc;
      });
    },
    bitor: (...args: any[]) => {
      return args.reduce((acc, curr) => {
        acc = acc | curr
        return acc;
      });
    },
    bitxor: (...args: any[]) => {
      return args.reduce((acc, curr) => {
        acc = acc ^ curr
        return acc;
      });
    },
    bitnot: (...args: any[]) => {
      checkInputs('bitnot', 1, args, 'number')
      return ~ args[0];
    },
    // this is wrong
    ashift: (...args: any[]) => {
      checkInputs('ashift', 2, args, 'number')
      return args[0] << args[1];
    },
    lshift: (...args: any[]) => {
      checkInputs('lshift', 2, args, 'number')
      return args[0] << args[1];
    },
  }

  aliases: {}

    registerPrimitives = () => {
    Object.entries(this.procedureDefs).forEach(([name, func]) => {
      this.env.defineProcedure(name, func);
    })

    // Object.entries(this.aliases).forEach(([alias, funcName]) => {
    //   const func = this.procedureDefs[funcName as Procedures]
    //   this.env.defineProcedure(alias, func);
    // })
  }
}
