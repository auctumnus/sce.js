import { Tokens } from '../scanner'
import { Tree, Nodes } from './node'
import { Parser } from './parser'
/**
 * Will be called by the clause content parser.
 * @typedef {Function} ClauseContentFunction
 * @param {Parser} parser The parser to use.
 * @param {Tree} pattern The current pattern for the clause content.
 * @param {Number|String} content The content of the token returned by parser.peek().
 * @param {Number} type The type of the token returned by parser.peek().
 * @param {Number} line The line of the token returned by parser.peek().
 */
interface ClauseContentFunction {
  (parser: Parser, pattern?: Tree, content?: string | number, type?: Tokens, line?: number): any
}

export type ClauseContentFunctionMap = Partial<Record<Tokens, ClauseContentFunction>>

/**
 * Helper for parsing clause content. Allows you to pass in an object of tokens
 * to functions, which will be called whenever the parser encounters that type of token.
 * @param {Parser} parser The parser to provide to each function.
 * @param {Number} treeType The node type to set for the tree.
 * @param {String} errorMessage The text to report if none of the accepted tokens are found immediately.
 * @param {Object} tokenToFunction An object mapping token types to functions to run.
 * @param {Boolean} allowOptional Whether to allow optional sequences.
 * @param {Boolean} isInOptional Whether the parser is currently in an optional sequence. You should generally not set this yourself.
 */
export const clauseContent = (parser: Parser, treeType: Nodes, errorMessage: string, tokenToFunction: ClauseContentFunctionMap, allowOptional: boolean = true) => {
  const acceptedTokens = Object.keys(tokenToFunction).map(Number)
  if (allowOptional) acceptedTokens.push(Tokens.leftparen)
  if (!allowOptional && parser.match(Tokens.leftparen)) {
    parser.error('unexpected optional sequence')
    parser.toLineEnd()
    return undefined
  }
  if (!parser.expect(errorMessage, ...acceptedTokens)) return undefined
  const pattern = new Tree(treeType)
  while (parser.match(...acceptedTokens)) {
    const { content, type, line } = parser.peek()
    if ((type === Tokens.leftparen) && allowOptional) {
      // handle optional sequence
      parser.advance()
      const tokenToFunctionSafe = tokenToFunction
      // remove token types from the function map if they wouldn't be allowed
      // these only occur in the environment, and they aren't allowed in
      // there, so it's safe to remove them
      if (Tokens.underscore in tokenToFunctionSafe) {
        delete tokenToFunctionSafe[Tokens.underscore]
      }
      if (Tokens.tilde in tokenToFunctionSafe) {
        delete tokenToFunctionSafe[Tokens.tilde]
      }

      const sequenceContent = clauseContent(parser, treeType, errorMessage, tokenToFunctionSafe, allowOptional)
      if (!parser.expect('expected closing parenthesis', Tokens.rightparen)) return undefined
      parser.advance()
      let nonGreedy = false
      if (parser.match(Tokens.question)) {
        nonGreedy = true
        parser.advance()
      }
      const type = nonGreedy ? Nodes.nonGreedyOptionalSequence : Nodes.optionalSequence
      const children = sequenceContent ? sequenceContent.children : []
      pattern.children.push(new Tree(type, children))
    } else {
      tokenToFunction[type](parser, pattern, content, type, line)
    }
  }
  if (!allowOptional && parser.match(Tokens.leftparen)) {
    parser.error('unexpected optional sequence')
    parser.toLineEnd()
    return undefined
  }
  return pattern
}
