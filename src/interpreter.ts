import { TokenType } from "./lexer";
import { ASTInfixNode, ASTNode, ASTNodeType, ASTProcedureNode, ASTProgramNode } from "./parser";

export class Environment {
  parent: Environment;
  vars: Map<string, any> = new Map();
  procedures: Map<string, any> = new Map();

  constructor(parent?: Environment) {
    this.parent = parent

    // Make is a special procedure for setting variables
    this.defineProcedure("make", (...args: any[]) => {
      if (args.length < 2) {
        throw new Error("Not enough inputs to MAKE")
      } else if (args.length > 2) {
        throw new Error(`You don't say what to do with ${args[2]}`);
      }
      this.set(args[0], args[1]);
    })
    this.defineProcedure("print", (val: string) => console.log(val))

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
    console.log(this.vars)
    if (this.vars.has(name)) return this.vars.get(name);
    throw new Error(`Undefined variable ${name}`);
  }

  set = (name: string, value: any) => {
    // maybe we should add some guards against assigning to global vars?? need
    // to check implemementaton
    this.vars.set(name, value);
    console.log(this.vars)
  }

  defineProcedure = (name: string, value: any) => {
    // maybe we should add some guards against assigning to global vars?? need
    // to check implemementaton
    this.procedures.set(name, value);
  }

  getProcedure = (name: string) => {
    if (this.procedures.has(name)) return this.procedures.get(name);
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

export function evaluate(exp: ASTNode, env: Environment): any {
  switch (exp.type) {
    // for literals, just return the value
    case ASTNodeType.StringLiteral:
    case ASTNodeType.NumberLiteral:
      return exp.value;
    // for programs, evaluate each of the expressions in them in them
    case ASTNodeType.Program:
      // probably should be a foreach
      return (exp as ASTProgramNode).program.map(exp => evaluate(exp, env))

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


    case ASTNodeType.ProcedureCall:
      const func = env.getProcedure(exp.value as string);
      const parsedArgs = (exp as ASTProcedureNode).args.map(arg => evaluate(arg, env));
      console.log('running', exp.value, 'with args', parsedArgs)
      return func(...parsedArgs);
    default:
      throw new Error(`I don't know how to evaluate ${exp.type} yet...`)
      break;
  }
}

export default function interpret(ast: ASTProgramNode) {
  const globalEnv = new Environment();
  evaluate(ast, globalEnv)
}
