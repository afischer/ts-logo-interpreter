import { Environment } from "../interpreter";

abstract class StdlibInterface<Procedures extends string> {
  env: Environment;

  // a mapping of how many arguments are typically expected, for the parser
  static procedureArgCounts: Record<string, number>;

  // definition of each procedure
  procedureDefs: Record<Procedures, (...args: any[]) => any>;

  // any aliased definitions
  aliases: Record<string, Procedures>;

  // funciton to call that registers primitives and aliases
  registerPrimitives: (env: Environment) => void;
}

export default StdlibInterface;
