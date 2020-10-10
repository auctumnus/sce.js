import { Tokens } from '../scanner'
import { Parser } from './parser'
import { Tree, Nodes } from './node'
import { addition, removal } from './additionDeletion'

import { target } from './target'
import { change } from './change'
import { environment, exception } from './environment'

const environmentException = (parser: Parser) => {
  let environmentClause,
    exceptionClause

  if (parser.match(Tokens.slash)) {
    environmentClause = environment(parser)
  }
  if (parser.match(Tokens.exclamation)) {
    exceptionClause = exception(parser)
  }

  return { environmentClause, exceptionClause }
}

const envExceptionElse = (parser: Parser) => {
  const fields = []
  const { environmentClause, exceptionClause } = environmentException(parser)
  fields.push(environmentClause, exceptionClause)

  // else clause - these can chain into environments and exceptions infinitely
  if (parser.match(Tokens.rightangle)) {
    const elseClause = change(parser)
    elseClause.type = Nodes.else
    fields.push(elseClause, ...envExceptionElse(parser))
  }
  return fields.filter(v => v !== undefined)
}

export const rule = (parser: Parser) => {
  const rule = new Tree(Nodes.rule)
  if (parser.match(Tokens.plus)) {
    // addition
    const { target, change } = addition(parser)
    rule.children.push(target, change)
  } else if (parser.match(Tokens.minus)) {
    // removal
    const { target, change } = removal(parser)
    rule.children.push(target, change)
  } else {
    const clauses = []
    clauses.push(target(parser))
    clauses.push(change(parser))
    if (parser.match(Tokens.slash, Tokens.exclamation, Tokens.rightangle)) {
      clauses.push(...envExceptionElse(parser))
    }

    if (!clauses.length) {
      parser.advance()
    } else {
      rule.children.push(...clauses)
    }
  }
  return rule
}
