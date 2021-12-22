import { Environment } from "./interpreter";
import { ASTNode, ASTNodeType } from "./parser";

function checkInputs(funcName: string, exact: number, args: any[], type?: string) {
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

function unimplemented() {
  throw new Error('Function unimplemented.')
}

export function getListString(list: ASTNode[]): string {
  console.log(list);

  return '[' + list.map(entry => entry.type === ASTNodeType.List ? getListString(entry.value as ASTNode[]) : entry.value).join(' ') + ']';
}

const word = (...args: any[]) => {
  checkInputs('word', 2, args)
  return args.join("")
}

const list = unimplemented;

const sentence =  unimplemented;

const fput = (...args: any[]) => {
  if (Array.isArray(args[1])) {
    return [
      { type: Array.isArray(args[0]) ? ASTNodeType.List : ASTNodeType.StringLiteral, value: args[0]},
      ...args[1]
    ]
  }
  word(args)
}

const lput = (...args: any[]) => {
  if (Array.isArray(args[1])) {
    return [
      ...args[1],
      { type: Array.isArray(args[0]) ? ASTNodeType.List : ASTNodeType.StringLiteral, value: args[0]},
    ]
  }
  return word(args.reverse())
}

export default function registerPrimitives(env: Environment) {
  const stdlib: Record<string, (...args: any[]) => void> = {

    /** 2 Data Structure Primitives */
    // 2.1 Constructors
    word,
    list,
    sentence,
    fput,
    lput,

    array: unimplemented,
    mdarray: unimplemented,
    listtoarray: unimplemented,
    arraytolist: unimplemented,
    combine: unimplemented,
    reverse: unimplemented,
    gensym: unimplemented,

    // 2.2
    first: (...args) => {
      checkInputs('first', 1, args)
      return args[0]
    },
    firsts: unimplemented,
    butfirst: unimplemented,
    butfirsts: unimplemented,
    butlast: unimplemented,
    item: unimplemented,
    mditem: unimplemented,
    pick: unimplemented,
    remove: unimplemented,
    remdup: unimplemented,
    quoted: unimplemented,

    // 2.3 Data Mutators
    setitem: unimplemented,
    mdsetitem: unimplemented,
    '.setfirst': unimplemented,
    '.setbf': unimplemented,
    '.setitem': unimplemented,
    push: unimplemented,
    pop: unimplemented,
    queue: unimplemented,
    dequeue: unimplemented,

    // 2.4 Predicates
    wordp: unimplemented,
    listp: unimplemented,
    arrayp: unimplemented,
    emptyp: unimplemented,
    equalp: (...args) => {
      return args[0] === args[1]
    },
    notequalp: unimplemented,
    beforep: unimplemented,
    '.eq': unimplemented,
    memberp: unimplemented,
    stringp: unimplemented,
    substringp: unimplemented,
    numberp: unimplemented,
    vbarredp: unimplemented,
    backslashedp: unimplemented,

    // 2.5 Queries
    // TK

    /** 3 Objects */

    /** 4 Communication */
    // 4.1 Transmitters
    print: (...args) => {
      // if (Array.isArray(args[0])) {
      //   process.stdout.write(getListString(args[0]) + '\n')
      //   return;
      // }
      process.stdout.write(args + '\n')
      return;
    },
    type: undefined,
    show: undefined,

    // 4.1 Recievers

    // 4.2 Transmitters
    // 4.3 File Access
    // 4.4 Terminal Access

    /** 4 Arithmetic */
    // 5.1 Numeric Operations
    // FIXME: should be able to sum words, e.g. sum "2 "3
    sum: (...args) => {
      checkInputs('make', 2, args, 'number')
      return args[0] + args[1];
    },
    difference: (...args) => {
      checkInputs('make', 2, args, 'number')
      return args[0] - args[1];
    },

    // 5.5 Bitwise Operations
    // bitand or xor not should work w multiple
    bitand: (...args) => {
      return args.reduce((acc, curr) => {
        acc = acc & curr
        return acc;
      });
    },
    bitor: (...args) => {
      return args.reduce((acc, curr) => {
        acc = acc | curr
        return acc;
      });
    },
    bitxor: (...args) => {
      return args.reduce((acc, curr) => {
        acc = acc ^ curr
        return acc;
      });
    },
    bitnot: (...args) => {
      checkInputs('bitnot', 1, args, 'number')
      return ~ args[0];
    },
    // this is wrong
    ashift: (...args) => {
      checkInputs('ashift', 2, args, 'number')
      return args[0] << args[1];
    },
    lshift: (...args) => {
      checkInputs('lshift', 2, args, 'number')
      return args[0] << args[1];
    },
    // ??

    'make': (...args: any[]) => {
      checkInputs('make', 2, args)
      env.set(args[0], args[1]);
    },

    // end is a NOOP, should just be at the end of procedure definitions
    'end': () => {}
  }

  // Functions that are aliased by removing the p and adding a question mark
  const qmarkAliases = [
    'wordp', 'listp', 'arrayp', 'emptyp', 'equalp', 'notequalp', 'beforep', 'memberp', 'stringp', 'substringp', 'numberp', 'vbarredp', 'backslashedp'
  ]


  Object.entries(stdlib).forEach(
    ([funcName, func]) => env.defineProcedure(funcName, func)
  );

  // alias predicates, e.g. wordp --> word?
  qmarkAliases.forEach(toAlias => {
    const func = stdlib[toAlias];
    const alias = toAlias.slice(0, -1) + '?';
    env.defineProcedure(alias, func);
  })
}
