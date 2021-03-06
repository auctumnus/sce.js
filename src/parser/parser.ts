'use strict'
import { tokenType, Tokens, Token } from '../scanner'
import { Tree, nodeType } from './node'

import { rule } from './rule'
import { metarule } from './metarule'
import { categoryDef } from './categories'

/**
 * A function which errors will be reported to. This defaults to console.error - if left unchanged, the error will be reported in a more human-friendly format.
 * @typedef {Function} Logger
 * @param {Object} error
 * @param {String} error.message A string describing the error.
 * @param {Number} error.line The line at which the error occurred.
 * @param {Number} error.linePos The column at which the error occurred.
 * @param {String|Number} error.content The content of the token where the error occurred.
 */
interface ParserError {
  message: string,
  line: number,
  linePos: number,
  content: string | number
}
interface ParserLogger {
  (ParserError): any
}

/**
 * The parser parses tokens from the scanner and turns them into an AST (Abstract Syntax Tree).
 * @typedef {Object} Parser
 * @property {Token[]} tokens The tokens to be parsed.
 * @property {Logger} logger The function to be called when an error occurs. The logger will receive an object with the line it occurred at and a message describing the error.
 */
export class Parser {
  tokens: Token[]
  logger: ParserLogger | Console['error'] // eslint-disable-line
  hadError: boolean
  current: number
  constructor (tokens, logger: ParserLogger | Console['error'] = console.error) { // eslint-disable-line
    if (!tokens) {
      throw new Error('No tokens provided.')
    } else if (!Array.isArray(tokens)) {
      throw new Error('Tokens must be an array of tokens.')
    }
    this.tokens = tokens
    this.logger = logger

    this.hadError = false

    this.current = 0
  }

  error (message: string) {
    // if we're past the first token, error there, otherwise error at first
    const token = this.current - 1 > 0 ? this.current - 1 : this.current
    const { line, linePos, content } = this.tokens[token]
    this.hadError = true
    if (this.logger === console.error) {
      this.logger(`Error at line ${line},${linePos} (near "${content}"): ${message}`)
    } else {
      this.logger({ line, linePos, content, message })
    }
  }

  /**
   * Indicates whether the parser has reached the end of tokens.
   * @returns {Boolean} Whether there are no more tokens to be parsed.
   */
  isAtEnd () {
    return this.current >= this.tokens.length
  }

  /**
   * Advances the parser to the next token.
   * @returns {Token} The now-current token.
   */
  advance () {
    this.current++
    return this.tokens[this.current - 1]
  }

  /**
   * Peeks at the next token in the array.
   * @returns {Token} The next token in the array.
   */
  peek () {
    return this.tokens[this.current]
  }

  /**
   * Returns true if the next token is of one of the types provided.
   * @param {...Number} types All of the possible types to match.
   * @returns {Boolean} Whether any of the types were matched.
   */
  match (...types: Tokens[]) {
    if (this.isAtEnd()) return false
    return types.includes(this.peek().type)
  }

  /**
   * Returns true if the token two spaces ahead is of one of the types provided.
   * @param {...Number} types All of the possible types to match.
   * @returns {Boolean} Whether any of the types were matched.
   */
  matchAhead (...types) {
    if (this.isAtEnd()) return false
    return this.tokens[this.current + 1] &&
           types.includes(this.tokens[this.current + 1].type)
  }

  /**
   * Errors and goes to line end if match() fails.
   * @param {String} message Message to report as an error if it fails.
   * @param  {...Number} names Names to pass to match().
   * @returns {Boolean} match() output
   */
  expect (message, ...names) {
    const result = this.match(...names)
    if (result) {
      return true
    } else {
      this.error(message)
      this.toLineEnd()
    }
  }

  /**
   * Gobbles newlines - grabs as many newlines as it can and moves the parser past them.
   */
  gobbleNewlines () {
    while (this.match(tokenType.newline)) this.advance()
  }

  /**
   * Skips until it finds a newline or EOF.
   */
  toLineEnd () {
    while (!this.match(tokenType.newline) &&
           !this.match(tokenType.eof)) this.advance()
  }

  /**
   * Parses the input and returns an Abstract Syntax Tree describing the input.
   * @returns {Tree}
   */
  parse () {
    const ast = new Tree(nodeType.ast)
    try {
      while (!this.match(tokenType.eof)) {
        this.gobbleNewlines()
        ast.children.push(this.line())
        this.gobbleNewlines()
      }
    } catch (err) {
      this.error('javascript error')
      this.logger(err)
    }
    return ast
  }

  /**
   * Parses multiple options for a certain function.
   * @param {Number} type The type to return for the tree.
   * @param {Function} fn The function to parse as a constituent part.
   * @param {Number} separator The token type to split on.
   * @returns {Tree} Syntax tree
   */
  options (type, fn, separator = tokenType.comma) {
    const tree = new Tree(type)
    while (1) {
      // have to bind this - for some reason, the called function otherwise
      // loses context and this becomes undefined ???
      tree.children.push(fn.bind(this)())
      if (!this.match(separator)) {
        break
      } else {
        this.advance()
      }
    }
    return tree
  }

  /**
   * Parses a line. (In the grammar, this is technically a runnable,
   * since the scanner skips anything else.)
   * @returns {Tree} The AST branch for the line.
   */
  line () {
    // metarule
    if (this.match(tokenType.exclamation)) {
      return new Tree(nodeType.metarule, [metarule(this)])
    // category definition
    } else if (this.matchAhead(tokenType.equals)) {
      return categoryDef(this)
    // rule
    } else {
      return rule(this)
    }
  }
}

/**
 * Wrapper function for the parser. Takes an array of tokens as produced by the scanner and turns them into an Abstract Syntax Tree (AST).
 * @param {Token[]} tokens The tokens to parse.
 * @param {Logger} logger The function to report errors to.
 */
export const parse = (tokens: Token[], logger: ParserLogger = console.error) => {
  return new Parser(tokens, logger).parse()
}
