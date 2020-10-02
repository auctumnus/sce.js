import { tokenType } from '../scanner'
import { Tree, Node, nodeType } from './node'

import { clauseContent } from './clauseContent'
import { textWithCategoriesConfig } from './target'

export const changeConfig = {
  ...textWithCategoriesConfig,
  [tokenType.percent]: (parser, pattern, content) => {
    pattern.children.push(new Node(nodeType.targetRef, content))
    parser.advance()
  },
  [tokenType.leftangle]: (parser, pattern, content) => {
    pattern.children.push(new Node(nodeType.reverseTargetRef, content))
    parser.advance()
  }
}

const singleReplacementChange = parser => {
  return clauseContent(parser, nodeType.singleReplacementChange, 'expected change content', changeConfig, false)
}

const multipleReplacementChange = parser => {
  const changefn = () => singleReplacementChange(parser)
  return parser.options(nodeType.multipleReplacementChange, changefn)
}

export const change = parser => {
  if(!parser.expect('expected change', tokenType.rightangle)) return undefined
  parser.advance()
  let change = multipleReplacementChange(parser)
  if(change.children.length === 1) {
    change = change.children[0]
  }
  return new Tree(nodeType.change, change)
}
