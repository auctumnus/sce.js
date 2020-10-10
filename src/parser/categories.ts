import { Tokens } from '../scanner'
import { Parser } from './parser'
import { Tree, Node, Nodes } from './node'

export const categoryRef = (parser: Parser) => {
  if (!parser.expect('expected opening brace', Tokens.leftbrace)) return undefined
  parser.advance()
  if (!parser.expect('expected category name', Tokens.text)) return undefined
  const name = parser.advance().content
  if (!parser.expect('expected closing brace', Tokens.rightbrace)) return undefined
  parser.advance()
  return new Node(Nodes.categoryRef, name)
}

const categoryDefOptionContent = (parser: Parser) => {
  if (!parser.expect('expected category def option content', Tokens.leftbrace, Tokens.text)) return undefined
  if (parser.match(Tokens.text)) {
    return new Node(Nodes.categoryDefOptionContent, parser.advance().content)
  } else if (parser.match(Tokens.leftbrace)) {
    return categoryRef(parser)
  }
}

const categoryDefPredicate = (parser: Parser) => {
  const catFn = () => categoryDefOptionContent(parser)
  return parser.options(Nodes.categoryDefPredicate, catFn, Tokens.comma)
}

export const categoryModification = (parser: Parser) => {
  if (!parser.expect('expected category name', Tokens.text)) return undefined
  const name = new Node(Nodes.categoryName, parser.advance().content)

  if (!parser.expect('expected += or -=', Tokens.catPlus,
    Tokens.catMinus)) return undefined
  const { type } = parser.advance()
  const predicate = categoryDefPredicate(parser)
  switch (type) {
    case Tokens.catPlus: {
      return new Tree(Nodes.categoryAddition, [name, predicate])
    }
    case Tokens.catMinus: {
      return new Tree(Nodes.categorySubtraction, [name, predicate])
    }
  }
}

export const categoryDef = (parser: Parser) => {
  if (!parser.expect('expected new category name', Tokens.text)) return undefined
  const name = new Node(Nodes.categoryName, parser.advance().content)
  if (!parser.expect('expected equals sign', Tokens.equals)) return undefined
  parser.advance()
  const predicate = categoryDefPredicate(parser)
  return new Tree(Nodes.categoryDef, [name, predicate])
}

export const temporaryCategory = (parser: Parser) => {
  if (!parser.expect('expected opening brace', Tokens.leftbrace)) return undefined
  parser.advance()
  if (!parser.expect('expected temporary category content', Tokens.text)) return undefined
  const predicate = categoryDefPredicate(parser)
  if (!parser.expect('expected closing brace', Tokens.rightbrace)) return undefined
  parser.advance()
  if (!predicate) return undefined
  return new Tree(Nodes.temporaryCategory, predicate.children)
}
