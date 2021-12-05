import lex from "../../src/lexer";
import Parser from "../../src/parser";

// helper to lex and return parsed output:
function getParserOutput(program: string) {
  const lexed = lex(program);
  const parser = new Parser(lexed);
  return parser.parse();
}

describe("lexer to parser tests", () => {
  test("nested procedure call", () => {
    expect(getParserOutput('PRINT FIRST "WORD').program).toEqual([
      {
        "type": "ProcedureCall",
        "value": "PRINT",
        "args": [
          {
            "type": "ProcedureCall",
            "value": "FIRST",
            "args": [
              {
                "type": "StringLiteral",
                "value": "WORD"
              }
            ]
          }
        ]
      }
    ])
  })
})
