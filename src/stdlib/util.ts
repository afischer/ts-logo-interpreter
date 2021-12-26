import { ASTNode, ASTNodeType } from "../parser";

export function unimplemented() {
  throw new Error('Function unimplemented.')
}

export function listStringFromASTNode(list: ASTNode[]): string {
  console.log(list);

  return '[' + list.map(entry => entry.type === ASTNodeType.List
    ? listStringFromASTNode(entry.value as ASTNode[])
    : entry.value).join(' ') + ']';
}

// for funcitons that can not take "rest" args in parens, use this to ensure args conform to
// specific lengths and types.
export function checkInputs(funcName: string, exact: number, args: any[], type?: 'number' | 'string' | 'array' | 'boolean') {
  if (args.length < exact) {
    throw new Error(`Not enough inputs for ${funcName}`);
  }
  if (type) {
    args.forEach(arg => {
      if (type === 'array' ? !Array.isArray(arg) : typeof arg !== type) {
        throw new Error(`${funcName} doesn't like ${arg} as input`);
      }
    })
  }
}
