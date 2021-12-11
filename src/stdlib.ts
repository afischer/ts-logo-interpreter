import { Environment } from "./interpreter";

function checkInputs(funcName: string, exact: number, args: any[]) {
  if (args.length < exact) {
    throw new Error(`Not enough inputs for ${funcName}`);
  }
}

export default function registerPrimitives(env: Environment) {
  const stdlib: Record<string, (args: any[]) => void> = {

    /** 2 Data Structure Primitives */
    // 2.1 Constructors
    'word': (...args) => {
      checkInputs('word', 2, args)
      return args.join("")
    },

    // ??

    'make': (...args: any[]) => {
      if (args.length < 2) {
        throw new Error("Not enough inputs to MAKE")
      } else if (args.length > 2) {
        throw new Error(`You don't say what to do with ${args[2]}`);
      }
      env.set(args[0], args[1]);
    },

    'print': (args) => console.log(args),

    // end is a NOOP, should just be at the end of procedure definitions
    'end': () => {}
  }


  Object.entries(stdlib).forEach(
    ([funcName, func]) => env.defineProcedure(funcName, func)
  );
}
