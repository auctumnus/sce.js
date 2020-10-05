import { tokenType } from '../scanner'
import { Node, nodeType } from './node'

import { clauseContent } from './clauseContent'
import { changeConfig } from './change'

export const environmentConfig = {
  ...changeConfig,
  [tokenType.underscore]: (parser, pattern, content) => {
    pattern.children.push(new Node(nodeType.underscore, content))
    parser.advance()
  },
  [tokenType.tilde]: (parser, pattern, content) => {
    pattern.children.push(new Node(nodeType.tilde, content))
    parser.advance()
  },
}

const isLocal = n => (n.type === nodeType.underscore) || 
                     (n.type === nodeType.adjacency)

const environmentContent = parser => {
  const content = clauseContent(parser, nodeType.environmentContent, 'expected environment content', environmentConfig)
  if(content.children.filter(isLocal).length) {
    content.flags.push('local')
  } else {
    content.flags.push('global')
  }
  return content
}

const parseMultiple = (parser, type) => {
  const envfn = () => environmentContent(parser)
  return parser.options(type, envfn)
}

export const environment = parser => {
  if(!parser.expect('expected environment', tokenType.slash)) return undefined
  parser.advance()
  return parseMultiple(parser, nodeType.environment)
}

export const exception = parser => {
  if(!parser.expect('expected exception', tokenType.exclamation)) return undefined
  parser.advance()
  return parseMultiple(parser, nodeType.exception)
}
