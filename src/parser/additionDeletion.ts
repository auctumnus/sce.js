import { Tokens } from '../scanner'
import { Parser } from './parser'
import { Tree, Node, Nodes } from './node'

import { position } from './position'
import { textWithCategories } from './target'

export const addition = (parser: Parser) => {
  if (!parser.expect('expected plus', Tokens.plus)) return undefined
  parser.advance()
  // addition is equivalent to [] > content, so rewrite it that way
  const target = new Tree(Nodes.singleReplacementTarget, [
    new Tree(Nodes.temporaryCategory)
  ])
  if (!parser.expect('expected addition target text', Tokens.text)) return undefined
  const change = new Tree(Nodes.change)
  const text = parser.advance().content
  change.children.push(new Tree(Nodes.singleReplacementChange, [
    new Node(Nodes.nonTargetContent, text)
  ]))
  if (parser.match(Tokens.at)) {
    target.children.push(position(parser))
  }
  return { target, change }
}

export const removal = (parser: Parser) => {
  if (!parser.expect('expected minus', Tokens.minus)) return undefined
  parser.advance()
  // like addition, removal is equivalent to content > [], so it'll be rewritten
  const target = textWithCategories(parser)
  if (!target) return { target, change: undefined }
  const change = new Tree(Nodes.change, [
    new Tree(Nodes.singleReplacementChange, [
      new Tree(Nodes.temporaryCategory)
    ])
  ])
  return { target, change }
}
