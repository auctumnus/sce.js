import { Tokens } from '../scanner'
import { Parser } from './parser'
import { Node, Nodes } from './node'

const getNextFlag = (parser: Parser) => {
  const next = parser.advance()
  if(typeof next.content !== 'string') {
    parser.error('Unexpected number')
    parser.toLineEnd()
    return undefined
  }
  return next.content.split(':')[1]
}

const metaruleDef = (parser: Parser) => {
  const content = getNextFlag(parser)
  if (!content) {
    parser.error('expected a name for def')
    parser.toLineEnd()
    return undefined
  }
  return new Node(Nodes.metaruleDef, content)
}

const metaruleBlock = (parser: Parser) => {
  const content = getNextFlag(parser)
  if (!content) {
    parser.error('expected a number for block')
    parser.toLineEnd()
    return undefined
  }
  // isInteger checks both NaN and integer-ness, so no isNaN call is needed
  if (!Number.isInteger(Number(content)) || Number(content) < 1) {
    parser.error('expected a positive integer for block')
    parser.toLineEnd()
    return undefined
  }
  return new Node(Nodes.metaruleRule, content)
}

const metaruleRule = (parser: Parser) => {
  const content = getNextFlag(parser)
  if (!content) {
    parser.error('expected a name for rule')
    parser.toLineEnd()
    return undefined
  }
  return new Node(Nodes.metaruleRule, content)
}

export const metarule = (parser: Parser) => {
  parser.advance() // past the !
  if (!parser.expect('expected metarule', Tokens.text)) return undefined
  const next = parser.peek()
  if(typeof next.content !== 'string') {
    parser.error('Unexpected number')
    parser.toLineEnd()
    return undefined
  }
  if (!next.content.startsWith('def:') &&
  !next.content.startsWith('rule:') &&
  !next.content.startsWith('block:')) {
    parser.error('expected one of "def", "rule", or "block"')
    parser.toLineEnd()
    return undefined
  }
  switch (next.content.split(':')[0]) {
    case 'def': return metaruleDef(parser)
    case 'rule': return metaruleRule(parser)
    case 'block': return metaruleBlock(parser)
  }
}
