import { tokenType } from '../scanner'
import { Node, nodeType } from './node'

export const repetition = parser => {
  if (!parser.expect('expected wildcard repetition', tokenType.leftcurly)) return undefined
  parser.advance()

  if (!parser.expect('expected number, wildcard, or non-greedy wildcard',
    tokenType.wildcard, tokenType.nonGreedyWildcard, tokenType.number)) return undefined
  const { type, content } = parser.advance()

  if (type === tokenType.number && content < 1) {
    parser.error('expected positive integer')
    parser.toLineEnd()
    return undefined
  }

  if (!parser.expect('expected closing brace', tokenType.rightcurly)) return undefined
  parser.advance()

  switch (type) {
    case tokenType.number: {
      return new Node(nodeType.numericRepetition, content)
    }
    case tokenType.nonGreedyWildcard: {
      return new Node(nodeType.nonGreedyWildcardRepetition, content)
    }
    case tokenType.wildcard: {
      return new Node(nodeType.wildcardRepetition, content)
    }
  }
}
