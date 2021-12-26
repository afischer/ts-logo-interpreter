import { TokenType } from "./lexer";
import { ASTConditionalNode, ASTInfixNode, ASTNode, ASTNodeType, ASTProcedureDefNode, ASTProcedureNode, ASTProgramNode } from "./parser";
import {registerPrimitives} from "./stdlib";
import { listStringFromASTNode } from "./stdlib/util";
export class Environment {
  parent: Environment;
  vars: Map<string, any> = new Map();
  procedures: Map<string, any> = new Map();

  constructor(parent?: Environment) {
    this.parent = parent
    if (parent) {
      this.procedures = parent.procedures;
    }

    registerPrimitives(this)
  }

  /**
   * Create a new new environment, with it's scope nested within this one
   * @returns a new child Environment
   */
  extend = (): Environment => {
    return new Environment(this)
  }

  /**
   * Finds the scope where a variable with a given name is defined by traversing
   * upward until it is found.
   */
  lookup = (name: string): Environment => {
    let scope: Environment = this;
    while (scope) {
      if (scope.vars.has(name)) return scope;
      scope = this.parent;
    }
  }

  /**
   * Variable getter and setter.
   * TODO: Make this case insensitive
   */
  get = (name: string) => {
    const scope = this.lookup(name)
    if (scope.vars.has(name)) return scope.vars.get(name);
    throw new Error(`Undefined variable ${name}`);
  }

  set = (name: string, value: any) => {
    // all set vars are in the global scope
    let scope: Environment = this;
    while (scope.parent) { scope = this.parent }
    scope.vars.set(name, value);
    // console.log('vars are now', this.vars)
  }

  defineProcedure = (name: string, value: any) => {
    // maybe we should add some guards against assigning to global vars?? need
    // to check implemementaton
    this.procedures.set(name.toLowerCase(), value);
  }

  getProcedure = (name: string) => {
    if (this.procedures.has(name.toLowerCase())) return this.procedures.get(name.toLowerCase());
    throw new Error(`I don't know how to ${name}`);
  }
}

function evaluateBinaryOp(operator: string, left: number, right: number) {
  switch (operator) {
    case TokenType.PLUS: return left + right;
    case TokenType.MINUS: return left - right;
    case TokenType.MULTIPLY: return left * right;
    case TokenType.DIVIDE: return left / right;
    case TokenType.LT: return left < right;
    case TokenType.GT: return left > right;
    case TokenType.EQL: return left === right;
    case TokenType.LEQ: return left <= right;
    case TokenType.GEQ: return left >= right;
    case TokenType.NEQ: return left !== right;
    default:
      throw new Error(`Can't apply operator ${operator}`);
  }
}

function evaluateProcedureDefinition(exp: ASTProcedureDefNode, env: Environment) {
  const procedureName = exp.value as string;
  const procedure = (...args: (string | number)[]) => {
    const vars = exp.vars;
    const scope = env.extend();
    // need to do some stuff with scope as vars are global in logo
    vars.forEach((variable, i) => {
      scope.set(variable.value as string, i < args.length ? args[i] : undefined);
    });
    return evaluate(exp.body, scope);
  }
  env.defineProcedure(procedureName, procedure);
}

const unwrapList = (listnode: ASTNode): Array<any> => {
  return (listnode.value as ASTNode[]).map(x => x.type === ASTNodeType.List ? unwrapList(x) : x.value)
}

export function evaluate(exp: ASTNode, env: Environment): any {
  if (exp === undefined) return; // comments, newlines

  switch (exp.type) {
    // for literals and lists, just return the value
    case ASTNodeType.StringLiteral:
    case ASTNodeType.NumberLiteral:
    case ASTNodeType.Boolean:
      return exp.value;
    case ASTNodeType.List:
      return unwrapList(exp)
    // for programs, evaluate each of the expressions in them in them
    case ASTNodeType.Program:
      // probably should be a foreach
      const returnVal = (exp as ASTProgramNode).program.map(exp => evaluate(exp, env))
      // all return vals should be undefined; procedures shoudl use all variables
      const unknownVal = returnVal.flatMap(x => x).find(x => x !== undefined);

      // if (unknownVal) {
      //   console.log('unknown val', unknownVal);

      //   // if (Array.isArray(unknownVal)) {
      //   //   throw new Error(`You don't say what to do with ${listStringFromASTNode(unknownVal)}`);
      //   // }
      //   throw new Error(`You don't say what to do with ${JSON.stringify(unknownVal, null, 2)}`);
      // }
      console.log(returnVal);

      return returnVal;


    // for variables, return their value
    case ASTNodeType.Variable:
      return env.get(exp.value as string)

    // for binary operations, do the math!
    case ASTNodeType.InfixOperation:
      const node = exp as ASTInfixNode;
      const left = evaluate(node.left, env)
      const right = evaluate(node.right, env)
      const operator = node.value as string;
      return evaluateBinaryOp(operator, left, right);

    case ASTNodeType.ProcedureDefinition:
      return evaluateProcedureDefinition(exp as ASTProcedureDefNode, env)

    // send as a function call to the stdlib, but with a different method signature
    case ASTNodeType.Conditional:
      const conditionalNode = exp as ASTConditionalNode;
      const condition = evaluate(conditionalNode.condition, env)
      console.log(condition);

      const ifFunc = env.getProcedure(exp.value as string)
      return ifFunc({
        condition,
        thenDo: conditionalNode.then,
        elseDo: conditionalNode.else,
      })

    case ASTNodeType.ProcedureCall:
      const func = env.getProcedure(exp.value as string);
      const parsedArgs = (exp as ASTProcedureNode).args.map(arg => evaluate(arg, env));
      // console.log('running', exp.value, 'with args', parsedArgs, func.toString())
      return func(...parsedArgs);
    default:
      throw new Error(`I don't know how to evaluate ${exp.type} yet...`)
  }
}

export default function interpret(ast: ASTProgramNode) {
  const globalEnv = new Environment();
  evaluate(ast, globalEnv)
}
