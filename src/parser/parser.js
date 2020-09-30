'use strict'

import { tokenType } from '../scanner'
import { Tree, nodeType } from './node'

import { metarule } from './metarule'
import { categoryDef } from './categories'
import { target } from './target' 

/**
 * A function which errors will be reported to. This defaults to console.error - if left unchanged, the error will be reported in a more human-friendly format.
 * @typedef {Function} Logger
 * @param {Object} error
 * @param {String} error.message A string describing the error.
 * @param {Number} error.line The line at which the error occurred.
 */

/**
 * The parser parses tokens from the scanner and turns them into an AST (Abstract Syntax Tree).
 * @typedef {Object} Parser
 * @property {Token[]} tokens The tokens to be parsed.
 * @property {Logger} logger The function to be called when an error occurs. The logger will receive an object with the line it occurred at and a message describing the error.
 */
export class Parser {
  constructor (tokens, logger = console.error) {
    this.tokens = tokens
    this.logger = logger

    this.hadError = false

    this.current = 0
  }

  error (message) {
    // if we're past the first token, error there, otherwise error at first
    let token = this.current - 1 > 0 ? this.current - 1 : this.current
    const line = this.tokens[token].line
    this.hadError = true
    if (this.logger === console.error) {
      this.logger(`Error at line ${line}: ${message}`)
    } else {
      this.logger({ line, message })
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
  match (...types) {
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
    } catch(err) {
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
      return metarule(this)
    // category definition
    } else if (this.matchAhead(tokenType.equals)) {
      return categoryDef(this)
    // rule
    } else {
      return this.rule()
    }
  }

  /**
   * Parses a rule.
   * @returns {Tree} The AST branch for the rule.
   */
  rule () {
    return target(this) || this.advance()
  }
}

/**
 * Wrapper function for the parser. Takes an array of tokens as produced by the scanner and turns them into an Abstract Syntax Tree (AST).
 * @param {Token[]} tokens The tokens to parse.
 * @param {Logger} logger The function to report errors to.
 */
export const parse = (tokens, logger=console.error) => {
  return new Parser(tokens, logger).parse()
}
