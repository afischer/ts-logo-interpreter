import { Environment } from "../interpreter";
import StdlibInterface from "./StdlibInterface";
import { checkInputs, unimplemented } from "./util";

type Procedures =
  "print"
| "type"
| "show"

/** 4 Communication */
export default class CommunicationPrimitives implements StdlibInterface<Procedures> {
  env: Environment;
  constructor(env: Environment) {
    this.env = env;
  }

  static procedureArgCounts: Record<Procedures, number> = {
    // 4.1 Transmitters
    print: 1,
    type: 1,
    show: 1,

    // 4.1 Recievers

    // 4.2 Transmitters
    // 4.3 File Access
    // 4.4 Terminal Access

  }

  procedureDefs = {
    // 4.1 Transmitters
    print: (...args: any[]) => {
      // if (Array.isArray(args[0])) {
      //   process.stdout.write(getListString(args[0]) + '\n')
      //   return;
      // }
      process.stdout.write(args + '\n')
      return;
    },
    type: unimplemented,
    show: unimplemented,

    // 4.1 Recievers

    // 4.2 Transmitters
    // 4.3 File Access
    // 4.4 Terminal Access
  }

  aliases: Record<string, Procedures> = {
    pr: 'print'
  }

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
