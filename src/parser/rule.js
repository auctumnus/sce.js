import { target } from './target'
import { change } from './change'
import { tokenType } from '../scanner'
import { Tree, nodeType } from './node'
import { addition, removal } from './additionDeletion'

export const rule = parser => {
  const rule = new Tree(nodeType.rule)
  if(parser.match(tokenType.plus)) {
    const { target, change } = addition(parser)
    rule.children.push(target, change)
  } else if(parser.match(tokenType.minus)) {
    const { target, change } = removal(parser)
    rule.children.push(target, change)
  } else {
    let targetClause = target(parser)
    let changeClause = change(parser)
    // if(parser.match(tokenType.slash)) parse environment
    if(!(targetClause || changeClause)) {
      parser.advance()
    } else {
      rule.children.push(targetClause, changeClause)
    }
  }
  return rule
}
