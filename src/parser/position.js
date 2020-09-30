import { tokenType } from '../scanner'
import { Node, nodeType } from './node'

const positionNumber = parser => {
  if (!parser.expect('expected number', tokenType.number)) return undefined
  return new Node(nodeType.positionNumber, parser.advance().content)
}

export const position = parser => {
  if (!parser.expect('expected position', tokenType.at)) return undefined
  parser.advance()
  if (!parser.expect('expected number', tokenType.number)) return undefined
  const numberfn = () => positionNumber(parser)
  return parser.options(nodeType.position, numberfn, tokenType.bar)
}