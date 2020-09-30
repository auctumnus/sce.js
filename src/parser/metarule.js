import { tokenType } from '../scanner'
import { Node, nodeType } from './node'

const metaruleDef = parser => {
  const content = parser.advance().content.split(':')[1]
  if (!content) {
    parser.error('expected a name for def')
    parser.toLineEnd()
    return undefined
  }
  return new Node(nodeType.metaruleDef, content)
}

const metaruleBlock = parser => {
  const content = parser.advance().content.split(':')[1]
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
  return new Node(nodeType.metaruleRule, content)
}

const metaruleRule = parser => {
  const content = parser.advance().content.split(':')[1]
  if (!content) {
    parser.error('expected a name for rule')
    parser.toLineEnd()
    return undefined
  }
  return new Node(nodeType.metaruleRule, content)
}

export const metarule = parser => {
  parser.advance() // past the !
  if (!parser.expect('expected metarule', tokenType.text)) return undefined
  if (!parser.peek().content.startsWith('def:') &&
  !parser.peek().content.startsWith('rule:') &&
  !parser.peek().content.startsWith('block:')) {
    parser.error('expected one of "def", "rule", or "block"')
    parser.toLineEnd()
    return undefined
  }
  switch (parser.peek().content.split(':')[0]) {
    case 'def': return metaruleDef(parser)
    case 'rule': return metaruleRule(parser)
    case 'block': return metaruleBlock(parser)
  }
}