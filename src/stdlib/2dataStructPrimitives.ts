import { Environment } from "../interpreter";
import { ASTNodeType } from "../parser";
import StdlibInterface from "./StdlibInterface";
import { checkInputs, unimplemented } from "./util";

type Procedures =
// 2.1 Constructors
'word'
 | 'list'
 | 'sentence'
 | 'se'
 | 'fput'
 | 'lput'
 | 'array'
 | 'mdarray'
 | 'listtoarray'
 | 'arraytolist'
 | 'combine'
 | 'reverse'
 | 'gensym'
 // 2.2 Data Selectors
 | 'first'
 | 'firsts'
 | 'last'
 | 'butfirst'
 | 'butfirsts'
 | 'butlast'
 | 'item'
 | 'mditem'
 | 'pick'
 | 'remove'
 | 'remdup'
 | 'quoted'
 // 2.3 Data Mutators
 | 'setitem'
 | 'mdsetitem'
 | '.setfirst'
 | '.setbf'
 | '.setitem'
 | 'push'
 | 'pop'
 | 'queue'
 | 'dequeue'
 // 2.4 Predicates
 | 'wordp'
 | 'listp'
 | 'arrayp'
 | 'emptyp'
 | 'empty?'
 | 'equalp'
 | 'notequalp'
 | 'beforep'
 | '.eq'
 | 'memberp'
 | 'substringp'
 | 'numberp'
 | 'vbarredp'
 | 'backslashedp'
 // 2.5 queries
 | 'count'
 | 'ascii'
 | 'rawascii'
 | 'char'
 | 'member'
 | 'lowercase'
 | 'uppercase'
 | 'standout'
 | 'parse'
 | 'runparse'

 export default class DataStructPrimitives implements StdlibInterface<Procedures> {
  env: Environment;
  constructor(env: Environment) {
    this.env = env;
  }

  static procedureArgCounts: Record<Procedures, number> = {
    // 2.1 Constructors
    word: 2,
    list: 2,
    sentence: 2,
    se: 2,
    fput: 2,
    lput: 2,
    array: 1,
    mdarray: 1,
    listtoarray: 1,
    arraytolist: 1,
    combine: 2,
    reverse: 1,
    gensym: 0,

    // 2.2 Data Selectors
    first: 1,
    firsts: 1,
    last: 1,
    butfirst: 1,
    butfirsts: 1,
    butlast: 1,
    item: 2,
    mditem: 2,
    pick: 1,
    remove: 2,
    remdup: 1,
    quoted: 1,

    // 2.3 Data Mutators
    setitem: 3,
    mdsetitem: 3,
    '.setfirst': 2,
    '.setbf': 2,
    '.setitem': 2,
    push: 2,
    pop: 1,
    queue: 2,
    dequeue: 1,

    // 2.4 Predicates
    wordp: 1,
    listp: 1,
    arrayp: 1,
    emptyp: 1,
    'empty?': 1,
    equalp: 2,
    notequalp: 2,
    beforep: 2,
    '.eq': 2,
    memberp: 2,
    substringp: 2,
    numberp: 1,
    vbarredp: 1,
    backslashedp: 1,

    // 2.5 queries
    count: 1,
    ascii: 1,
    rawascii: 1,
    char: 1,
    member: 2,
    lowercase: 1,
    uppercase: 1,
    standout: 1,
    parse: 1,
    runparse: 1,
  }

  procedureDefs = {
    // 2.1 Constructors
    word: (...args: any[]) => {
      if (args.length < 2) throw new Error("Not enough inputs to word")
      return args.join("")
    },
    list: unimplemented,
    sentence: (...args: any[]) => {
      if (args.length < 2) throw new Error("Not enough inputs to sentence")
      return args.reduce((acc, curr) => {
        if (Array.isArray(curr)) {
          acc.push(...curr)
          return acc;
        }
        acc.push(curr)
        return acc;
      }, [])
    },
    se: unimplemented, // actually implemented above
    fput: (...args: any[]) => {
      if (Array.isArray(args[1])) { return [args[0], ...args[1]] }
      return args.join('')
    },
    lput: (...args: any[]) => {
      if (Array.isArray(args[1])) { return [...args[1], args[0]] }
      return args.reverse().join("")
    },
    array: unimplemented,
    mdarray: unimplemented,
    listtoarray: unimplemented,
    arraytolist: unimplemented,
    combine: unimplemented,
    reverse: unimplemented,
    gensym: unimplemented,

    // 2.2 Data Selectors
    first: (...args: any[]) => {
      checkInputs('first', 1, args)
      return args[0]
    },
    firsts: unimplemented,
    last: unimplemented,
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
    emptyp: (...args: any[]) => {
      return args[0].length > 0
    },
    'empty?': unimplemented, // not really
    equalp: (...args: any[]) => {
      return args[0] === args[1]
    },
    notequalp: unimplemented,
    beforep: unimplemented,
    '.eq': unimplemented,
    memberp: unimplemented,
    substringp: unimplemented,
    numberp: unimplemented,
    vbarredp: unimplemented,
    backslashedp: unimplemented,

    // 2.5 queries
    count: unimplemented,
    ascii: unimplemented,
    rawascii: unimplemented,
    char: unimplemented,
    member: unimplemented,
    lowercase: unimplemented,
    uppercase: unimplemented,
    standout: unimplemented,
    parse: unimplemented,
    runparse: unimplemented,
  };

  aliases: Record<string, Procedures> = {
    se: 'sentence',
    bf: 'butfirst',
    bfs: 'butfirsts',
    'word?': 'wordp',
    'list?': 'listp',
    'array?': 'arrayp',
    'empty?': 'emptyp',
    'equal?': 'equalp',
    'notequal?': 'notequalp',
    'before?': 'beforep',
    'member?': 'memberp',
    'substring?': 'substringp',
    'number?': 'numberp',
    'vbarred?': 'vbarredp',
    'backslashedp': 'vbarredp',
    'backslashed?': 'vbarredp'
  }

  registerPrimitives = () => {
    Object.entries(this.procedureDefs).forEach(([name, func]) => {
      this.env.defineProcedure(name, func);
    })

    Object.entries(this.aliases).forEach(([alias, funcName]) => {
      const func = this.procedureDefs[funcName as Procedures]
      this.env.defineProcedure(alias, func);
    })
  }
}
