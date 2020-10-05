import { tokenType } from '../scanner'
import { Tree, nodeType } from './node'
import { addition, removal } from './additionDeletion'

import { target } from './target'
import { change } from './change'
import { environment, exception } from './environment'

const environmentException = parser => {
  let environmentClause, 
      exceptionClause

  if(parser.match(tokenType.slash)) {
    environmentClause = environment(parser)
  }
  if(parser.match(tokenType.exclamation)) {
    exceptionClause = exception(parser)
  }

  return { environmentClause, exceptionClause }
}

const envExceptionElse = parser => {
  const fields = []
  const { environmentClause, exceptionClause } = environmentException(parser)
  fields.push(environmentClause, exceptionClause)
  
  // else clause - these can chain into environments and exceptions infinitely
  if(parser.match(tokenType.rightangle)) {
    const elseClause = change(parser)
    elseClause.type = nodeType.else
    fields.push(elseClause, ...envExceptionElse(parser))
  }
  return fields.filter(v => v !== undefined)
}

export const rule = parser => {
  const rule = new Tree(nodeType.rule)
  if(parser.match(tokenType.plus)) {
    // addition
    const { target, change } = addition(parser)
    rule.children.push(target, change)
  } else if(parser.match(tokenType.minus)) {
    // removal
    const { target, change } = removal(parser)
    rule.children.push(target, change)
  } else {
    const clauses = []
    clauses.push(target(parser))
    clauses.push(change(parser))
    if(parser.match(tokenType.slash, tokenType.exclamation, tokenType.rightangle)) {
      clauses.push(...envExceptionElse(parser))
    }

    if(!clauses.length) {
      parser.advance()
    } else {
      rule.children.push(...clauses)
    }
  }
  return rule
}
