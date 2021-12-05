import { TokenType } from "./lexer";
import { ASTInfixNode, ASTNode, ASTNodeType, ASTProcedureNode, ASTProgramNode } from "./parser";

class Environment {
  parent: Environment;
  vars: Map<string, any> = new Map();

  constructor(parent?: Environment) {
    this.parent = parent
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
   * Variable getter and setter
   */
  get = (name: string) => {
    if (this.vars.has(name)) return this.vars.get(name);
    throw new Error(`Undefined variable ${name}`);
  }

  set = (name: string, value: any) => {
    // maybe we should add some guards against assigning to global vars?? need
    // to check implemementaton
    this.vars.set(name, value);
  }
}

function evaluateBinaryOp(operator: string, left: number, right: number) {
  console.log('evaluating binop', operator, left, right)
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

function evaluate(exp: ASTNode, env: Environment): any {
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


    // case ASTNodeType.ProcedureCall:
    //   const parsedArgs = (exp as ASTProcedureNode).args.map(arg => evaluate(arg, env));

    // const func = evaluate(exp, env);

    // case ASTNodeType.Assignment:
    //   return env.
    default:
      throw new Error(`I don't know how to evaluate ${exp.type} yet...`)
      break;
  }
}

export default function interpret(ast: ASTProgramNode) {
  const globalEnv = new Environment();

  globalEnv.set("print", (val: string) => console.log(val))

  evaluate(ast, globalEnv)
}
