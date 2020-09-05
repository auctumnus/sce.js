'use strict'
/* Turns a string into an array of tokens. */

/**
 * Characters which cannot be part of any text.
 */
const specialCharacters = ';^ >/!+-[](){}*?"%<^,&_~@\n|'

const tokenArray = [
  'text', 'number',

  'leftparen', 'rightparen',
  'leftbrace', 'rightbrace',
  'leftcurly', 'rightcurly',
  'leftangle', 'rightangle', 'copy', 'move',

  'wildcard', 'extendedWildcard',
  'nonGreedyWildcard', 'nonGreedyExtendedWildcard',

  'quote',
  'percent',
  'underscore',
  'tilde',
  'at',
  'equals',
  'slash',

  'exclamation',
  'question',
  'plus', 'minus',
  'comma',
  'semicolon', 'bar',

  'equals',
  'catPlus', 'catMinus',
  'greaterThan', 'lessThan',

  'newline',
  'eof'
]

export const tokenType = Object.freeze(Object.fromEntries(tokenArray.map((k, i) => [k, i])))

const simpleMap = {
  '(': 'leftparen',
  ')': 'rightparen',
  '[': 'leftbrace',
  ']': 'rightbrace',
  '{': 'leftcurly',
  '}': 'rightcurly',
  '"': 'quote',
  '%': 'percent',
  _: 'underscore',
  '~': 'tilde',
  '@': 'at',
  '!': 'exclamation',
  '?': 'question',
  ',': 'comma',
  ';': 'semicolon',
  '=': 'equals',
  '|': 'bar'
}

/**
 * A token created by the scanner.
 * @typedef {Object} Token
 * @property {Number} type The type of the token.
 * @property {String} content The content of the token.
 * @property {Number} line The line that the token occurs on.
 */
export class Token {
  constructor (type, content, line) {
    this.type = type
    this.content = content
    this.line = line
  }

  get [Symbol.toStringTag] () {
    return tokenArray[this.type]
  }
}

export class Scanner {
  /**
   * Creates a new Scanner to step through the input string source.
   * @param {String} source The input source for the SCE ruleset.
   * @param {Function} logger The function to pass errors to. If none is given, the default is console.error. If a function is provided, the errors will provided as an object matching {line: (line), message: (message)}.
   */
  constructor (source, logger = console.error) {
    this.source = source
    this.logger = logger

    this.tokens = []

    this.hadError = false

    this.current = 0
    this.start = 0
    this.length = source.length
    this.line = 1
  }

  /**
   * Sets hadError to true and reports the error to the logger.
   * @param {String} message The message to report.
   */
  error (message) {
    this.hadError = true
    if (this.logger === console.error) {
      this.logger(`Error at line ${this.line}: ${message}`)
    } else {
      this.logger({ line: this.line, message })
    }
  }

  /**
   * Tokenizes the input source string.
   * @returns {Token[]} An array of {@link Token} class objects containing information about the tokens scanned from the input.
   */
  scanTokens () {
    while (!this.isAtEnd()) {
      this.start = this.current
      this.scanToken()
    }
    this.addToken(tokenType.eof, '')
    return this.tokens
  }

  /**
   * Indicates whether the scanner has reached the end of the input.
   * @returns {Boolean} Whether the scanner is at the end of the input.
   */
  isAtEnd () {
    return this.current >= this.length
  }

  /**
   * Increments the current character and returns the new character to be read.
   * @returns {String} The character now pointed to by the value of current.
   */
  advance () {
    this.current++
    return this.source[this.current - 1]
  }

  /**
   * Returns the next character without incrementing the value of current.
   * @returns {String} The next character in the source text.
   */
  peek () {
    if (this.isAtEnd()) {
      return ''
    } else {
      return this.source[this.current]
    }
  }

  /**
   * Peeks at the next character and returns true if the next character matches queryChar. Otherwise, returns false.
   * @param {...String} queryChars The character(s) to match.
   * @returns {Boolean} Whether the character was found in the next position.
   */
  match (...queryChars) {
    if (queryChars.includes(this.peek())) {
      return true
    } else {
      return false
    }
  }

  /**
   * Adds a new token to the tokens array of the scanner.
   * @param {Number} type The type of the token.
   * @param {String} content The full text content of the token.
   */
  addToken (type, content) {
    this.tokens.push(new Token(type, content, this.line))
  }

  /**
   * Skips past all characters in a comment, since we don't care about the content of a comment.
   */
  comment () {
    // while not at the end of a line or at the end of the input
    while (!(this.match('\n') || this.isAtEnd())) this.advance()
  }

  /**
   * Returns true if this.match() would return true for a number.
   */
  matchNumber () {
    return this.match(...'-0123456789'.split(''))
  }

  /**
   * Scans a number.
   */
  number () {
    let value = this.source[this.current - 1]
    while (this.matchNumber() && !this.isAtEnd()) {
      if (this.match('-')) break
      value += this.peek()
      this.advance()
    }
    const parsed = Number(value)
    if (Number.isNaN(parsed)) {
      this.error('invalid number')
    } else {
      this.addToken(tokenType.number, parsed)
    }
  }

  /**
   * Consumes a block of text and returns it as one text token.
   */
  text () {
    let value = this.source[this.current - 1]
    // check if the next character is reserved
    while (!this.match(...specialCharacters.split('')) &&
           !this.isAtEnd() &&
           !this.matchNumber()) {
      if (this.match('\\')) {
        this.advance()
      }
      value += this.peek()
      this.advance()
    }
    this.addToken(tokenType.text, value)
  }

  /**
   * Skips past whitespace.
   */
  whitespace () {
    while (this.match(' ', '/r', '/t') && !this.isAtEnd()) this.advance()
  }

  /**
   * Scans the next token.
   */
  scanToken () {
    const char = this.advance()
    if (Object.prototype.hasOwnProperty.call(simpleMap, char)) {
      this.addToken(tokenType[simpleMap[char]], char)
      return
    }
    switch (char) {
      // special characters
      case '-': {
        if (this.matchNumber()) {
          this.number()
        } else {
          if (this.match('=')) {
            this.advance()
            this.addToken(tokenType.catMinus, '-=')
          } else {
            this.addToken(tokenType.minus, '-')
          }
        }
        break
      }

      case '+': {
        if (this.match('=')) {
          this.advance()
          this.addToken(tokenType.catPlus, '+=')
        } else {
          this.addToken(tokenType.plus)
        }
        break
      }

      case '<': {
        if (this.match('=')) {
          this.advance()
          this.addToken(tokenType.lessThan, '<=')
        } else {
          this.addToken(tokenType.leftangle)
        }
        break
      }
      case '>': {
        if (this.match('=')) {
          this.advance()
          this.addToken(tokenType.greaterThan, '>=')
        } else {
          this.whitespace()
          if (this.match('^')) {
            this.advance()
            this.whitespace()
            if (this.match('?')) { // >^?
              this.advance()
              this.addToken(tokenType.move, '>^?')
            } else { // >^
              this.addToken(tokenType.copy, '>^')
            }
          } else { // >
            this.addToken(tokenType.angleright, '>')
          }
        }
        break
      }
      case '*': {
        if (this.match('*')) {
          this.advance()
          if (this.match('?')) { // **?
            this.advance()
            this.addToken(tokenType.nonGreedyExtendedWilcard, '**?')
          } else { // **
            this.addToken(tokenType.extendedWildcard, '**')
          }
        } else if (this.match('?')) { // *?
          this.advance()
          this.addToken(tokenType.nonGreedyWildcard, '*?')
        } else { // *
          this.addToken(tokenType.wildcard, '*')
        }
        break
      }
      case '/': {
        if (this.match('/')) this.comment()
        else this.addToken(tokenType.slash, '/')
        break
      }
      // newline
      case '\n': {
        this.addToken(tokenType.newline, '\n')
        this.line++
        break
      }
      // whitespace
      case '\t': case '\r': case ' ': break

      // otherwise, treat the character as text
      default: {
        if ('0123456789'.split('').includes(char)) this.number()
        else this.text()
        break
      }
    }
  }
}
