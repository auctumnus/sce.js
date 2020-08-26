/* eslint-disable */
'use strict'

/**
 * Parses an array of tokens into an AST (Abstract Syntax Tree).
 * @param {Token[]} tokens The array of tokens to be parsed.
 */
const parse = tokens => {
  const ruleset = [
  ]
}

/**
 *
 * @param {Token[]} tokens The array of tokens.
 * @param {Number} position The current position in the array of tokens.
 */
const walk = (tokens, position) => {
  let tree = []
  const token = tokens[position]
  switch (token.type) {
    case 'whitespace': {
      const childTree = walk(tokens, position + 1)
      position = childTree.position
      tree = childTree.tree
      break
    }
    case 'text': {
      tree.push({
        type: 'stringLiteral',
        value: token.value
      })
      position++
      break
    }
    // an addition rule is essentially just a rule with an empty target and
    // a replacement, so we can subsume this into replacement checking
    case 'plus': case 'angleBracketRight': {
      const childTree = walk(tokens, position + 1)
      position = childTree.position
      tree.push({
        type: 'replacementDef',
        value: childTree.tree
      })
      break
    }
  }
  return {
    tree,
    position
  }
}
