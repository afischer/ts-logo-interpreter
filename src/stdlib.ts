import { Environment } from "./interpreter";

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

export default function registerPrimitives(env: Environment) {
  const stdlib: Record<string, (...args: any[]) => void> = {

    /** 2 Data Structure Primitives */
    // 2.1 Constructors
    word: (...args) => {
      checkInputs('word', 2, args)
      return args.join("")
    },

    list: unimplemented,
    sentence: unimplemented,
    fput: unimplemented,
    lput: unimplemented,
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
    equalp: unimplemented,
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
      process.stdout.write(args.join(' ') + '\n')
      return undefined;
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
    // sum: (...args) => {
    //   checkInputs('make', 2, args, 'number')
    //   return args[0] + args[1];
    // },

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
}
