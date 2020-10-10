import { Tokens } from '../scanner'
import { Parser } from './parser'
import { Node, Nodes, Tree } from './node'

import { clauseContent, ClauseContentFunctionMap } from './clauseContent'
import { changeConfig } from './change'
import { repetition } from './repetition'
import { position } from './position'

const comparisonOperators = [
  Tokens.greaterThanOrEqual,
  Tokens.lessThanOrEqual,
  Tokens.rightangle,
  Tokens.leftangle,
  Tokens.equals
]

const globalCount = (parser: Parser) => {
  if (!parser.expect('expected global count', Tokens.leftcurly)) return undefined
  parser.advance()
  if (!parser.expect('expected comparison operator', ...comparisonOperators)) return undefined

  const operator = parser.advance()
  console.log('got operator')

  if (!parser.expect('expected integer', Tokens.number)) return undefined
  const number = parser.advance().content
  if (number < 0) {
    parser.error('expected count to be 0 or greater')
    parser.toLineEnd()
    return undefined
  }
  console.log('got number')

  if (!parser.expect('expected closing right curly brace', Tokens.rightbrace)) return undefined
  parser.advance()

  const operatorNode = new Node(Nodes.comparisonOperator, operator.content)
  const numberNode = new Node(Nodes.countNumber, number)

  return new Tree(Nodes.globalCount, [operatorNode, numberNode])
}

export const environmentConfig: ClauseContentFunctionMap = {
  ...changeConfig,
  [Tokens.underscore]: (parser: Parser, pattern: Tree, content: Node['content']) => {
    pattern.children.push(new Node(Nodes.underscore, content))
    parser.advance()
  },
  [Tokens.tilde]: (parser: Parser, pattern: Tree, content: Node['content']) => {
    pattern.children.push(new Node(Nodes.adjacency, content))
    parser.advance()
  },
  [Tokens.leftcurly]: (parser: Parser, pattern: Tree) => {
    console.log(parser.peek())
    console.log(parser.tokens[parser.current + 1])
    console.log(parser.matchAhead(...comparisonOperators))
    if (parser.matchAhead(...comparisonOperators)) {
      pattern.children.push(globalCount(parser))
    } else {
      pattern.children.push(repetition(parser))
    }
    parser.advance()
  }
}

const checkLocalOrGlobal = (parser: Parser, content: Tree) => {
  let hasGlobalCount = false
  let hasUnderscore = false
  let hasAdjacency = false

  content.children.forEach(node => {
    if (!node) {
      return undefined
    } else if (node.type === Nodes.underscore) {
      hasUnderscore = true
    } else if (node.type === Nodes.adjacency) {
      hasAdjacency = true
    } else if (node.type === Nodes.globalCount) {
      hasGlobalCount = true
    }
  })

  const local = hasUnderscore || hasAdjacency

  if (local && hasGlobalCount) {
    parser.error('global count in local environment')
    parser.toLineEnd()
    return undefined
  } else {
    return local ? 'local' : 'global'
  }
}

const environmentContent = (parser: Parser) => {
  const content = clauseContent(parser, Nodes.environmentContent, 'expected environment content', environmentConfig)

  const envType = checkLocalOrGlobal(parser, content)
  if (envType === undefined) return undefined
  else content.flags.push(envType)

  if (parser.match(Tokens.at)) {
    content.children.push(position(parser))
  }
  return content
}

const parseMultiple = (parser: Parser, type: Nodes) => {
  const envfn = () => environmentContent(parser)
  return parser.options(type, envfn)
}

export const environment = (parser: Parser) => {
  if (!parser.expect('expected environment', Tokens.slash)) return undefined
  parser.advance()
  return parseMultiple(parser, Nodes.environment)
}

export const exception = (parser: Parser) => {
  if (!parser.expect('expected exception', Tokens.exclamation)) return undefined
  parser.advance()
  return parseMultiple(parser, Nodes.exception)
}
