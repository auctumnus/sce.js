import { Tokens } from '../scanner'
import { Node, Nodes } from './node'
import { Parser } from './parser'

export const wildcard = (parser: Parser) => {
  if (!parser.expect('expected wildcard', Tokens.wildcard,
    Tokens.extendedWildcard,
    Tokens.nonGreedyWildcard,
    Tokens.nonGreedyExtendedWildcard)) return undefined
  switch (parser.advance().type) {
    case Tokens.wildcard: {
      return new Node(Nodes.wildcard, '*')
    }
    case Tokens.extendedWildcard: {
      return new Node(Nodes.extendedWildcard, '**')
    }
    case Tokens.nonGreedyWildcard: {
      return new Node(Nodes.nonGreedyWildcard, '*?')
    }
    case Tokens.nonGreedyExtendedWildcard: {
      return new Node(Nodes.nonGreedyExtendedWildcard, '**?')
    }
  }
}
