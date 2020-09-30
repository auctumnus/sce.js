import { tokenType } from '../scanner'
import { Node, nodeType } from './node'

export const wildcard = parser => {
  if (!parser.expect('expected wildcard', tokenType.wildcard,
    tokenType.extendedWildcard,
    tokenType.nonGreedyWildcard,
    tokenType.nonGreedyExtendedWildcard)) return undefined
  switch (parser.advance().type) {
    case tokenType.wildcard: {
      return new Node(nodeType.wildcard, '*')
    }
    case tokenType.extendedWildcard: {
      return new Node(nodeType.extendedWildcard, '**')
    }
    case tokenType.nonGreedyWildcard: {
      return new Node(nodeType.nonGreedyWildcard, '*?')
    }
    case tokenType.nonGreedyExtendedWildcard: {
      return new Node(nodeType.nonGreedyExtendedWildcard, '**?')
    }
  }
}