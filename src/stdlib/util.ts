import { ASTNode, ASTNodeType } from "../parser";

export function unimplemented() {
  throw new Error('Function unimplemented.')
}

export function getListString(list: ASTNode[]): string {
  return '[' + list.map(entry => entry.type === ASTNodeType.List
    ? getListString(entry.value as ASTNode[])
    : entry.value).join(' ') + ']';
}

// for funcitons that can not take "rest" args in parens, use this to ensure args conform to
// specific lengths and types.
export function checkInputs(funcName: string, exact: number, args: any[], type?: string) {
  if (args.length < exact) {
    throw new Error(`Not enough inputs for ${funcName}`);
  }
  if (type) {
    args.forEach(arg => {
      if (typeof arg !== type) {
        throw new Error(`${funcName} doesn't like ${arg} as input`);
      }
    })
  }
}
