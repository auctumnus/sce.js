import { Tokens } from '../scanner'
import { Parser } from './parser'
import { Tree, Node, Nodes } from './node'

import { clauseContent } from './clauseContent'
import { textWithCategoriesConfig } from './target'

export const changeConfig = {
  ...textWithCategoriesConfig,
  [Tokens.percent]: (parser, pattern, content) => {
    pattern.children.push(new Node(Nodes.targetRef, content))
    parser.advance()
  },
  [Tokens.leftangle]: (parser, pattern, content) => {
    pattern.children.push(new Node(Nodes.reverseTargetRef, content))
    parser.advance()
  }
}

const singleReplacementChange = (parser: Parser) => {
  return clauseContent(parser, Nodes.singleReplacementChange, 'expected change content', changeConfig, false)
}

const multipleReplacementChange = (parser: Parser) => {
  const changefn = () => singleReplacementChange(parser)
  return parser.options(Nodes.multipleReplacementChange, changefn)
}

export const change = (parser: Parser) => {
  if (!parser.expect('expected change', Tokens.rightangle)) return undefined
  parser.advance()
  let change: Node | Tree = multipleReplacementChange(parser)
  if (change.children.length === 1) {
    change = change.children[0]
  }
  return new Tree(Nodes.change, [change])
}
