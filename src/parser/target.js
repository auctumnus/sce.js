import { tokenType } from '../scanner'
import { Tree, Node, nodeType } from './node'

import { wildcard } from './wildcard'
import { position } from './position'
import { repetition } from './repetition'
import { temporaryCategory, categoryRef } from './categories'

export const textWithCategories = parser => {
  const acceptedTokens = [
    tokenType.text,
    tokenType.leftcurly,
    tokenType.leftbrace,
    tokenType.wildcard, tokenType.extendedWildcard,
    tokenType.nonGreedyWildcard, tokenType.nonGreedyExtendedWildcard,
    tokenType.quote,
    tokenType.number, tokenType.semicolon, tokenType.bar
  ]
  if (!parser.expect('expected target text', ...acceptedTokens)) return undefined
  const pattern = new Tree(nodeType.textWithCategories)
  while (parser.match(...acceptedTokens)) {
    const { type, content } = parser.peek()
    switch (type) {
      case tokenType.semicolon:
      case tokenType.bar:
      case tokenType.text: {
        pattern.children.push(new Node(nodeType.text, content))
        parser.advance()
        break
      }
      case tokenType.number: {
        pattern.children.push(new Node(nodeType.text, content + ''))
        parser.advance()
        break
      }
      case tokenType.quote: {
        pattern.children.push(new Node(nodeType.ditto, content))
        parser.advance()
        break
      }
      case tokenType.leftcurly: {
        pattern.children.push(repetition(parser))
        break
      }
      case tokenType.leftbrace: {
        if (parser.matchAhead(tokenType.comma)) {
          pattern.children.push(temporaryCategory(parser))
        } else {
          pattern.children.push(categoryRef(parser))
        }
        break
      }
      case tokenType.wildcard:
      case tokenType.extendedWildcard:
      case tokenType.nonGreedyWildcard:
      case tokenType.nonGreedyExtendedWildcard: {
        pattern.children.push(wildcard(parser))
        break
      }
    }
  }
  return pattern
}

const singleReplacementTarget = parser => {
  const children = [textWithCategories(parser)]
  if (parser.match(tokenType.at)) {
    children.push(position(parser))
  }
  return new Tree(nodeType.singleReplacementTarget, children)
}

const multipleReplacementTarget = parser => {
  const singlefn = () => singleReplacementTarget(parser)
  return parser.options(nodeType.multipleReplacementTarget, singlefn)
}

export const target = parser => {
  const target = multipleReplacementTarget(parser)
  if (target.children.length === 1) {
    return target.children[0]
  } else {
    return target
  }
}