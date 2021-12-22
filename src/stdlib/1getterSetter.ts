import { Environment } from "../interpreter";
import { ASTNodeType } from "../parser";
import StdlibInterface from "./StdlibInterface";
import { checkInputs, unimplemented } from "./util";

type Procedures =
"make"
| 'thing'
| "end"


export default class GetterSetterPrimitives implements StdlibInterface<Procedures> {
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

// // this is ugly, eventually turn this into a
// const getterSetterPrimitives: StdlibInterface<Procedures> = {} as StdlibInterface<Procedures>;

// getterSetterPrimitives.procedureArgCounts = {
//   make: 2,
//   end: 0,
// },

// // some fakery here as the getter/setter syntax needs access to the environment
// getterSetterPrimitives.registerPrimitives = (env) => {
//   env.defineProcedure('make', (...args: any[]) => {
//     checkInputs('make', 2, args)
//     env.set(args[0], args[1]);
//   })

//   env.defineProcedure('thing', (...args: any[]) => {
//     checkInputs('thing', 1, args, 'string')
//     return env.get(args[0])
//   })

//   env.defineProcedure('end', () => {}); // noop end
//   // Object.entries(getterSetterPrimitives.procedureDefs).forEach(([name, func]) => {
//   //   env.defineProcedure(name, func);
//   // })

//   // Object.entries(getterSetterPrimitives.aliases).forEach(([alias, funcName]) => {
//   //   const func = getterSetterPrimitives.procedureDefs[funcName]
//   //   env.defineProcedure(alias, func);
//   // })
// }

// export default getterSetterPrimitives;
