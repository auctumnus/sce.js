import { Tokens } from '../scanner'
import { Node, Nodes } from './node'
import { Parser } from './parser'

export const repetition = (parser: Parser) => {
  if (!parser.expect('expected wildcard repetition', Tokens.leftcurly)) return undefined
  parser.advance()

  if (!parser.expect('expected number, wildcard, or non-greedy wildcard',
    Tokens.wildcard, Tokens.nonGreedyWildcard, Tokens.number)) return undefined
  const { type, content } = parser.advance()

  if (type === Tokens.number && content < 1) {
    parser.error('expected positive integer')
    parser.toLineEnd()
    return undefined
  }

  if (!parser.expect('expected closing brace', Tokens.rightcurly)) return undefined
  parser.advance()

  switch (type) {
    case Tokens.number: {
      return new Node(Nodes.numericRepetition, content)
    }
    case Tokens.nonGreedyWildcard: {
      return new Node(Nodes.nonGreedyWildcardRepetition, content)
    }
    case Tokens.wildcard: {
      return new Node(Nodes.wildcardRepetition, content)
    }
  }
}
