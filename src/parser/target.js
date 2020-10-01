import { tokenType } from '../scanner'
import { Tree, Node, nodeType } from './node'

import { wildcard } from './wildcard'
import { position } from './position'
import { repetition } from './repetition'
import { temporaryCategory, categoryRef } from './categories'
import { clauseContent } from './clauseContent'

const text = (parser, pattern, content) => {
  pattern.children.push(new Node(nodeType.text, content))
  parser.advance()
}

const runWildcard = (parser, pattern) => pattern.children.push(wildcard(parser))

export const textWithCategoriesConfig = {
  [tokenType.text]: text,
  [tokenType.bar]: text,
  [tokenType.semicolon]: text,

  [tokenType.number]: (parser, pattern, content) => {
    pattern.children.push(new Node(nodeType.text, content + ''))
    parser.advance()
  },

  [tokenType.quote]: (parser, pattern, content) => {
    pattern.children.push(new Node(nodeType.ditto, content))
    parser.advance()
  },

  [tokenType.leftcurly]: (parser, pattern) => {
    pattern.children.push(repetition(parser))
  },

  [tokenType.leftbrace]: (parser, pattern) => {
    if (parser.matchAhead(tokenType.comma)) {
      pattern.children.push(temporaryCategory(parser))
    } else if(parser.matchAhead(tokenType.rightbrace)) {
      // empty category
      pattern.children.push(new Tree(nodeType.temporaryCategory))
      parser.advance()
      parser.advance()
    } else {
      pattern.children.push(categoryRef(parser))
    }
  },

  [tokenType.wildcard]: runWildcard,
  [tokenType.extendedWildcard]: runWildcard,
  [tokenType.nonGreedyWildcard]: runWildcard,
  [tokenType.nonGreedyExtendedWildcard]: runWildcard
}

export const textWithCategories = parser => {
  return clauseContent(parser, nodeType.textWithCategories, 'expected target', textWithCategoriesConfig)
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
  let target = multipleReplacementTarget(parser)
  if(target.children.length === 1) {
    target = target.children[0]
  }
  return new Tree(nodeType.target, target)
}