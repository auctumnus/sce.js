import { Tokens } from '../scanner'
import { Tree, Node, Nodes } from './node'

import { wildcard } from './wildcard'
import { position } from './position'
import { repetition } from './repetition'
import { temporaryCategory, categoryRef } from './categories'
import { clauseContent, ClauseContentFunctionMap } from './clauseContent'
import { Parser } from './parser'

const text = (parser: Parser, pattern: Tree, content: string | number) => {
  pattern.children.push(new Node(Nodes.text, String(content)))
  parser.advance()
}

const runWildcard = (parser, pattern) => pattern.children.push(wildcard(parser))

export const textWithCategoriesConfig: ClauseContentFunctionMap = {
  [Tokens.text]: text,
  [Tokens.bar]: text,
  [Tokens.semicolon]: text,

  [Tokens.number]: text,

  [Tokens.quote]: (parser, pattern, content) => {
    pattern.children.push(new Node(Nodes.ditto, content))
    parser.advance()
  },

  [Tokens.leftcurly]: (parser, pattern) => {
    pattern.children.push(repetition(parser))
  },

  [Tokens.leftbrace]: (parser, pattern) => {
    if (parser.matchAhead(Tokens.comma)) {
      pattern.children.push(temporaryCategory(parser))
    } else if (parser.matchAhead(Tokens.rightbrace)) {
      // empty category
      pattern.children.push(new Tree(Nodes.temporaryCategory))
      parser.advance()
      parser.advance()
    } else {
      pattern.children.push(categoryRef(parser))
    }
  },

  [Tokens.wildcard]: runWildcard,
  [Tokens.extendedWildcard]: runWildcard,
  [Tokens.nonGreedyWildcard]: runWildcard,
  [Tokens.nonGreedyExtendedWildcard]: runWildcard
}

export const textWithCategories = parser => {
  return clauseContent(parser, Nodes.textWithCategories, 'expected target', textWithCategoriesConfig)
}

const singleReplacementTarget = parser => {
  const children = [...textWithCategories(parser).children]
  if (parser.match(Tokens.at)) {
    children.push(position(parser))
  }
  return new Tree(Nodes.singleReplacementTarget, children)
}

const multipleReplacementTarget = parser => {
  const singlefn = () => singleReplacementTarget(parser)
  return parser.options(Nodes.multipleReplacementTarget, singlefn)
}

export const target = parser => {
  let target = multipleReplacementTarget(parser)
  if (target.children.length === 1) {
    target = target.children[0]
  }
  return new Tree(Nodes.target, target)
}
