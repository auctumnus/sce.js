'use strict'
/* Tokenizes a string. */

export const charToType = {
  '(': 'parenLeft',
  ')': 'parenRight',
  '[': 'squareBracketLeft',
  ']': 'squareBracketRight',
  '{': 'curlyBracketLeft',
  '}': 'curlyBracketRight',
  '+': 'plus',
  '-': 'minus',
  '<': 'angleBracketLeft',
  '>': 'angleBracketRight',
  '/': 'slash',
  '\\': 'backslash',
  ',': 'comma',
  '&': 'ampersand',
  '!': 'exclamation',
  '*': 'asterisk',
  '@': 'at',
  _: 'underscore',
  '#': 'hash',
  '?': 'question',
  '%': 'percent',
  '"': 'quote',
  $: 'dollar',
  ' ': 'whitespace',
  '\n': 'newline'
}

/**
 * Represents a token.
 */
export class Token {
  /**
   * Creates a new Token.
   * @param {String} type The type of token.
   * @param {String} value The value.
   */
  constructor (type, value) {
    this.type = type
    this.value = value
  }
}

/**
 * Tokenizes an SCE ruleset. Newlines are allowed, but must be regularized to
 * \n.
 * @param {String} string The string of rules to be tokenized.
 * @returns {Token[]} An array of Token objects.
 */
export const tokenize = string => {
  const tokens = []
  for (const char of string) {
    if (Object.prototype.hasOwnProperty.call(charToType, char)) {
      tokens.push(new Token(charToType[char], char))
    } else {
      if (tokens[tokens.length - 1] && tokens[tokens.length - 1].type === 'text') {
        tokens[tokens.length - 1].value += char
      } else {
        tokens.push(new Token('text', char))
      }
    }
  }
  return tokens
}
