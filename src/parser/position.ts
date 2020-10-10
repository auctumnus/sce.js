import { Tokens } from '../scanner'
import { Node, Nodes } from './node'
import { Parser } from './parser'

const positionNumber = (parser: Parser) => {
  if (!parser.expect('expected number', Tokens.number)) return undefined
  return new Node(Nodes.positionNumber, parser.advance().content)
}

export const position = (parser: Parser) => {
  if (!parser.expect('expected position', Tokens.at)) return undefined
  parser.advance()
  if (!parser.expect('expected number', Tokens.number)) return undefined
  const numberfn = () => positionNumber(parser)
  return parser.options(Nodes.position, numberfn, Tokens.bar)
}
