import { Scanner, Token, tokenType, scan } from './scanner'
import { Tree, Node, nodeType } from './parser/node'
import { Parser, parse } from './parser/parser'

const getVersion = () => '0.1.0'

export {
  Scanner,
  Token,
  tokenType,
  scan,

  Tree,
  Node,
  nodeType,
  Parser,
  parse,

  getVersion
}
