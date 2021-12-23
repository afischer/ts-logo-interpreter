import { Environment } from "../interpreter";
import WorkspaceManagementPrimitives from "./8workspaceManagement";
import DataStructPrimitives from "./2dataStructPrimitives";
import CommunicationPrimitives from "./4communicationPrimitives";
import ArithmeticPrimitives from "./5arithmetic";
import LogicalPrimitives from "./6logic";
import StdlibInterface from "./StdlibInterface";


const primitives = [WorkspaceManagementPrimitives, DataStructPrimitives, CommunicationPrimitives, ArithmeticPrimitives, LogicalPrimitives];

// export mega list of argument counts
export const procedureArgCounts: Map<string, number> = primitives.reduce((acc, {procedureArgCounts}) => {
  Object.entries(procedureArgCounts).forEach(([k, v]) => acc.set(k, v));
  return acc;
}, new Map());


// register all primitives
export const registerPrimitives = (env: Environment) => {
  primitives.forEach(PrimitiveLib => {
    const lib = new PrimitiveLib(env);
    lib.registerPrimitives()
  })
}
