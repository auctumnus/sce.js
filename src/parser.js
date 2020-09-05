'use strict'

import { tokenType } from './scanner'

const nodeArray = [
  'ast',

  'line',
  'rule', 'metarule',

  'metaruleDef',
  'metaruleBlock',
  'metaruleRule',

  'categoryDef', 'temporaryCategory',
  'categoryRef',
  'categoryName',
  'categoryDefOptionContent', 'categoryDefPredicate',
  'categoryAddition', 'categorySubtraction',

  'wildcard', 'extendedWildcard',
  'nonGreedyWildcard', 'nonGreedyExtendedWildcard',

  'numericRepetition',
  'wildcardRepetition', 'nonGreedyWildcardRepetition',

  'textWithCategories',
  'text',
  'ditto',

  'positionNumber',
  'position',

  'singleReplacementTarget', 'multipleReplacementTarget', 'target',

  'flagList', 'binaryFlag', 'ternaryFlag', 'numericFlag'
]

export const nodeType = Object.freeze(Object.fromEntries(nodeArray.map((k, i) => [k, i])))

/**
 * A tree is a node with children, as opposed to content. It can also store flags.
 * @typedef {Object} Tree
 * @property {Number} type The type of tree.
 * @property {(Tree|Node)[]} children An array of trees and nodes that are the children of this tree.
 * @property {String[]} flags The flags set on this tree.
 * @property {Boolean} isTree Whether the object is a tree. Always true.
 * @property {Boolean} isNode Whether the object is a node. Always false.
 */
export class Tree {
  /**
   * Creates a new Tree.
   * @param {Number} type The type of the tree.
   * @param {(Tree|Node)[]} children The children of the tree.
   * @param {String[]} flags Flags set on the tree.
   */
  constructor (type, children = [], flags = []) {
    this.type = type
    this.children = children
    this.flags = flags
    this.isTree = true
    this.isNode = false
  }

  /**
   * Indicates whether this tree has the flag provided.
   * @param {String} name The flag name to look for.
   * @returns {Boolean} Whether this tree has the flag provided or not.
   */
  hasFlag (name) {
    return this.flags.includes(name)
  }

  get [Symbol.toStringTag]() {
    return nodeArray[this.type]
  }
}

/**
 * A node has a type and content, but not children.
 * @typedef {Object} Node
 * @property {Number} type The type of node this is. 
 * @property {String|Object} content The content of the node.
 * @property {Boolean} isTree Whether the object is a tree. Always false.
 * @property {Boolean} isNode Whether the object is a node. Always true.
 */
export class Node {
  constructor (type, content) {
    this.type = type
    this.content = content
    this.isTree = false
    this.isNode = true
  }

  get [Symbol.toStringTag]() {
    return nodeArray[this.type]
  }
}

/**
 * The parser parses tokens from the scanner and turns them into an AST (Abstract Syntax Tree).
 * @typedef {Object} Parser
 * @property {Token[]} tokens The tokens to be parsed.
 * @property {Function} logger The function to be called when an error occurs. The logger will receive an object with the line it occurred at and a message describing the error.
 */
export class Parser {
  constructor (tokens, logger = console.error) {
    this.tokens = tokens
    this.logger = logger

    this.hadError = false

    this.current = 0
  }

  error (message) {
    const line = this.tokens[this.current - 1].line
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
    return this.tokens[this.current + 1]
           && types.includes(this.tokens[this.current + 1].type)
  }

  /**
   * Errors and goes to line end if match() fails.
   * @param {String} message Message to report as an error if it fails.
   * @param  {...Number} names Names to pass to match().
   * @returns {Boolean} match() output
   */
  expect (message, ...names) {
    const result = this.match(...names)
    if(result) {
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
    while (!this.match(tokenType.newline) 
           && !this.match(tokenType.eof)) this.advance()
  }

  /**
   * Parses the input and returns an Abstract Syntax Tree describing the input.
   * @returns {Tree}
   */
  parse () {
    const ast = new Tree(nodeType.ast)
    while (!this.match(tokenType.eof)) {
      this.gobbleNewlines()
      ast.children.push(this.line())
      this.gobbleNewlines()
    }
    return ast
  }

  /**
   * Parses a line. (In the grammar, this is technically a runnable,
   * since the scanner skips anything else.)
   * @returns {Tree} The AST branch for the line.
   */
  line () {
    // metarule
    if(this.match(tokenType.exclamation)) {
      return this.metarule()
    // category definition
    } else if(this.matchAhead(tokenType.equals)) {
      return this.categoryDef()
    // rule
    } else {
      return this.rule()
    }
  }

  metarule () {
    this.advance() // past the !
    if(!this.expect('expected metarule', tokenType.text)) return undefined
    if(!this.peek().content.startsWith('def:')
    && !this.peek().content.startsWith('rule:')
    && !this.peek().content.startsWith('block:')) {
      this.error('expected one of "def", "rule", or "block"')
      this.toLineEnd()
      return undefined
    }
    switch(this.peek().content.split(':')[0]) {
      case 'def':   return this.metaruleDef()
      case 'rule':  return this.metaruleRule()
      case 'block': return this.metaruleBlock()
    }
  }

  metaruleDef () {
    const content = this.advance().content.split(':')[1]
    if(!content) {
      this.error('expected a name for def')
      this.toLineEnd()
      return undefined
    }
    return new Node(nodeType.metaruleDef, content)
  }

  metaruleBlock () {
    const content = this.advance().content.split(':')[1]
    if(!content) {
      this.error('expected a number for block')
      this.toLineEnd()
      return undefined
    }
    // isInteger checks both NaN and integer-ness, so no isNaN call is needed
    if(!Number.isInteger(Number(content)) || Number(content) < 1) {
      this.error('expected a positive integer for block')
      this.toLineEnd()
      return undefined
    }
    return new Node(nodeType.metaruleRule, content)
  }

  metaruleRule () {
    const content = this.advance().content.split(':')[1]
    if(!content) {
      this.error('expected a name for rule')
      this.toLineEnd()
      return undefined
    }
    return new Node(nodeType.metaruleRule, content)
  }

  /**
   * Parses multiple options for a certain function.
   * @param {Number} type The type to return for the tree.
   * @param {Function} fn The function to parse as a constituent part.
   * @param {Number} separator The token type to split on.
   */
  options (type, fn, separator = tokenType.comma) {
    const tree = new Tree(type)
    while(1) {
      // have to bind this - for some reason, the called function otherwise
      // loses context and this becomes undefined ???
      tree.children.push(fn.bind(this)())
      if(!this.match(separator)) {
        break
      } else {
        this.advance()
      }
    }
    return tree
  }

  binaryFlag () {
    if(!this.expect('expected flag', tokenType.text)) return undefined
    const content = this.advance().content
    if(content == 'ignore' || content == 'rtl') {
      return new Node(nodeType.binaryFlag, content)
    } else {
      this.error('expected one of "ignore" or "rtl"')
      this.toLineEnd()
      return undefined
    }
  }

  ternaryFlag () {
    if(!this.expect('expected flag', tokenType.exclamation, 
                                     tokenType.text)) return undefined
    let content = ''
    if(this.match(tokenType.exclamation)) {
      content += '!'
      this.advance()
    }
    if(!this.expect('expected one of "ditto" or "stop"', tokenType.text)) return undefined

    let textContent = this.advance().content
    if(textContent === 'ditto' || textContent === 'stop') {
      return new Node(nodeType.ternaryFlag, content + textContent)
    } else {
      this.error('expected one of "ditto" or "stop"')
      this.toLineEnd()
      return undefined
    }
  }

  numericFlag () {
    if(!this.expect('expected flag', tokenType.text)) return undefined
    let flag = this.advance().content
    if(flag === 'repeat:' || flag === 'persist:' || flag === 'chance:') {
      // remove colon at end
      flag = flag.slice(0, flag.length - 1)
      if(!this.expect('expected number', tokenType.number)) return undefined
      let number = this.advance().content
      // according to SCE docs, repeat and persist have a max of 1000 and a 
      // minimum of 1
      if((flag !== 'chance') && (number < 1 || number > 1000)) {
        this.error('number must be between 1 and 1000')
        this.toLineEnd()
        return undefined
      }
      // chance has a lower max value at 100 (for 100%)
      if((flag === 'chance') && (number < 1 || number > 100)) {
        this.error('number must be between 1 and 100')
        this.toLineEnd()
        return undefined
      }
      return new Node(nodeType.numericFlag, {flag, number})
    } else {
      this.error('expected one of "repeat" or "persist" or "chance"')
      this.toLineEnd()
      return undefined
    }
  }

  flag () {
    if(this.match(tokenType.exclamation)) {
      return this.ternaryFlag()
    } else if(this.match(tokenType.text)) {
      switch(this.peek().content) {
        case 'ignore': case 'rtl': {
          return this.binaryFlag()
        }
        case 'ditto': case 'stop': {
          return this.ternaryFlag()
        }
        case 'repeat:': case 'persist:': case 'chance:': {
          return this.numericFlag()
        }
        default: {
          this.error('expected flag')
          this.toLineEnd()
          return undefined
        }
      }
    } else {
      this.error('expected flag')
      this.toLineEnd()
      return undefined
    }
  }

  flag_list () {
    const flagFn = this.flag
    return this.options(nodeType.flagList, flagFn, tokenType.semicolon)
  }

  categoryModification () {
    if(!this.expect('expected category name', tokenType.text)) return undefined
    const name = new Node(nodeType.categoryName, this.advance().content)

    if(!this.expect('expected += or -=', tokenType.catPlus, 
                                         tokenType.catMinus)) return undefined
    const { type } = this.advance()
    const predicate = this.categoryDefPredicate()
    switch(type) {
      case tokenType.catPlus: {
        return new Tree(nodeType.categoryAddition, [name, predicate])
      }
      case tokenType.catMinus: {
        return new Tree(nodeType.categorySubtraction, [name, predicate])
      }
    }
  }

  categoryDef () {
    if(!this.expect('expected new category name', tokenType.text)) return undefined
    const name = new Node(nodeType.categoryName, this.advance().content)
    if(!this.expect('expected equals sign', tokenType.equals)) return undefined
    this.advance()
    const predicate = this.categoryDefPredicate()
    return new Tree(nodeType.categoryDef, [name, predicate])
  }

  categoryRef () {
    if(!this.expect('expected opening brace', tokenType.leftbrace)) return undefined
    this.advance()
    if(!this.expect('expected category name', tokenType.text)) return undefined
    let name = this.advance().content
    if(!this.expect('expected closing brace', tokenType.rightbrace)) return undefined
    this.advance()
    return new Node(nodeType.categoryRef, name)
  }
  
  categoryDefOptionContent () {
    if(!this.expect('expected category def option content', tokenType.leftbrace, tokenType.text)) return undefined
    if(this.match(tokenType.text)) {
      return new Node(nodeType.categoryDefOptionContent, this.advance().content)
    } else if(this.match(tokenType.leftbrace)) {
      return this.categoryRef()
    }
  }

  categoryDefPredicate () {
    const catFn = this.categoryDefOptionContent
    return this.options(nodeType.categoryDefPredicate, catFn, tokenType.comma)
  }

  temporaryCategory () {
    if(!this.expect('expected opening brace', tokenType.leftbrace)) return undefined
    this.advance()
    if(!this.expect('expected temporary category content', tokenType.text)) return undefined
    let predicate = this.categoryDefPredicate()
    if(!this.expect('expected closing brace', tokenType.rightbrace)) return undefined
    this.advance()
    if(!predicate) return undefined
    return new Tree(nodeType.temporaryCategory, predicate.children)
  }

  wildcard () {
    if(!this.expect('expected wildcard', tokenType.wildcard,
                                         tokenType.extendedWildcard,
                                         tokenType.nonGreedyWildcard,
                                         tokenType.nonGreedyExtendedWildcard)) return undefined
    switch(this.advance().type) {
      case tokenType.wildcard: {
        return new Node(nodeType.wildcard, '*')
      }
      case tokenType.extendedWildcard: {
        return new Node(nodeType.extendedWildcard, '**')
      }
      case tokenType.nonGreedyWildcard: {
        return new Node(nodeType.nonGreedyWildcard, '*?')
      }
      case tokenType.nonGreedyExtendedWildcard: {
        return new Node(nodeType.nonGreedyExtendedWildcard, '**?')
      }
    }
  }

  repetition () {
    if(!this.expect('expected wildcard repetition', tokenType.leftcurly)) return undefined
    this.advance()

    if(!this.expect('expected number, wildcard, or non-greedy wildcard',
                    tokenType.wildcard, tokenType.nonGreedyWildcard, tokenType.number)) return undefined
    const { type, content } = this.advance()

    if(type === tokenType.number && content < 1) {
      this.error('expected positive integer')
      this.toLineEnd()
      return undefined
    }

    if(!this.expect('expected closing brace', tokenType.rightcurly)) return undefined
    this.advance()

    switch(type) {
      case tokenType.number: {
        return new Node(nodeType.numericRepetition, content)
      }
      case tokenType.nonGreedyWildcard: {
        return new Node(nodeType.nonGreedyWildcardRepetition, content)
      }
      case tokenType.wildcard: {
        return new Node(nodeType.wildcardRepetition, content)
      }
    }
  }

  textWithCategories () {
    const acceptedTokens = [
      tokenType.text, 
      tokenType.leftcurly, 
      tokenType.leftbrace,
      tokenType.wildcard, tokenType.extendedWildcard,
      tokenType.nonGreedyWildcard, tokenType.nonGreedyExtendedWildcard,
      tokenType.quote,
      tokenType.number, tokenType.semicolon, tokenType.bar
    ]
    if(!this.expect('expected target text', ...acceptedTokens)) return undefined
    let pattern = new Tree(nodeType.textWithCategories)
    while(this.match(...acceptedTokens)) {
      const { type, content } = this.peek()
      switch(type) {
        case tokenType.semicolon: 
        case tokenType.bar:
        case tokenType.text: {
          pattern.children.push(new Node(nodeType.text, content))
          this.advance()
          break
        }
        case tokenType.number: {
          pattern.children.push(new Node(nodeType.text, content + ''))
          this.advance()
          break
        }
        case tokenType.quote: {
          pattern.children.push(new Node(nodeType.ditto, content))
          this.advance()
          break
        }
        case tokenType.leftcurly: {
          pattern.children.push(this.repetition())
          break
        }
        case tokenType.leftbrace: {
          if(this.tokens[this.current + 2] && 
             this.tokens[this.current + 2].type === tokenType.comma) {
            pattern.children.push(this.temporaryCategory())
          } else {
            pattern.children.push(this.categoryRef())
          }
          break
        }
        case tokenType.wildcard: 
        case tokenType.extendedWildcard:
        case tokenType.nonGreedyWildcard:
        case tokenType.nonGreedyExtendedWildcard: {
          pattern.children.push(this.wildcard())
          break
        }
      }
    }
    return pattern
  }

  positionNumber () {
    if(!this.expect('expected number', tokenType.number)) return undefined
    return new Node(nodeType.positionNumber, this.advance().content)
  }
  position () {
    if(!this.expect('expected position', tokenType.at)) return undefined
    this.advance()
    if(!this.expect('expected number', tokenType.number)) return undefined
    const numberfn = this.positionNumber
    return this.options(nodeType.position, numberfn, tokenType.bar)
  }

  singleReplacementTarget () {
    const children = [this.textWithCategories()]
    if(this.match(tokenType.at)) {
      children.push(this.position())
    }
    return new Tree(nodeType.singleReplacementTarget, children)
  }

  multipleReplacementTarget () {
    const singlefn = this.singleReplacementTarget
    return this.options(nodeType.multipleReplacementTarget, singlefn)
  }

  target () {
    let target = this.multipleReplacementTarget()
    if(target.children.length === 1) {
      return target.children[0]
    } else {
      return target
    }
  }

  /**
   * Parses a rule.
   * @returns {Tree} The AST branch for the rule.
   */
  rule () {
    this.advance()
  }
}
