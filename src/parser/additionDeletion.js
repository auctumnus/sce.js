import { tokenType } from '../scanner'
import { Tree, Node, nodeType } from './node'

import { position } from './position'
import { textWithCategories } from './target'

export const addition = parser => {
  if(!parser.expect('expected plus', tokenType.plus)) return undefined
  parser.advance()
  // addition is equivalent to [] > content, so rewrite it that way
  const target = new Tree(nodeType.singleReplacementTarget, [
    new Tree(nodeType.temporaryCategory)
  ])
  if (!parser.expect('expected addition target text', tokenType.text)) return undefined
  const change = new Tree(nodeType.change)
  const text = parser.advance().content
  change.children.push(new Tree(nodeType.singleReplacementChange, [
    new Node(nodeType.nonTargetContent, text)
  ]))
  if(parser.match(tokenType.at)) {
    target.children.push(position(parser))
  }
  return { target, change }
}

export const removal = parser => {
  if(!parser.expect('expected minus', tokenType.minus)) return undefined
  parser.advance()
  // like addition, removal is equivalent to content > [], so it'll be rewritten
  const target = textWithCategories(parser)
  if(!target) return { target, change: undefined }
  const change = new Tree(nodeType.change, [
    new Tree(nodeType.singleReplacementChange, [
      new Node
    ])
  ])
  return { target, change }
}