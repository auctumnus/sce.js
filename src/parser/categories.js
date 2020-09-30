import { tokenType } from '../scanner'
import { Tree, Node, nodeType } from './node'

export const categoryRef = parser => {
  if (!parser.expect('expected opening brace', tokenType.leftbrace)) return undefined
  parser.advance()
  if (!parser.expect('expected category name', tokenType.text)) return undefined
  const name = parser.advance().content
  if (!parser.expect('expected closing brace', tokenType.rightbrace)) return undefined
  parser.advance()
  return new Node(nodeType.categoryRef, name)
}

const categoryDefOptionContent = parser => {
  if (!parser.expect('expected category def option content', tokenType.leftbrace, tokenType.text)) return undefined
  if (parser.match(tokenType.text)) {
    return new Node(nodeType.categoryDefOptionContent, parser.advance().content)
  } else if (parser.match(tokenType.leftbrace)) {
    return categoryRef(parser)
  }
}

const categoryDefPredicate = parser => {
  const catFn = () => categoryDefOptionContent(parser)
  return parser.options(nodeType.categoryDefPredicate, catFn, tokenType.comma)
}

export const categoryModification = parser => {
  if (!parser.expect('expected category name', tokenType.text)) return undefined
  const name = new Node(nodeType.categoryName, parser.advance().content)

  if (!parser.expect('expected += or -=', tokenType.catPlus,
    tokenType.catMinus)) return undefined
  const { type } = parser.advance()
  const predicate = categoryDefPredicate(parser)
  switch (type) {
    case tokenType.catPlus: {
      return new Tree(nodeType.categoryAddition, [name, predicate])
    }
    case tokenType.catMinus: {
      return new Tree(nodeType.categorySubtraction, [name, predicate])
    }
  }
}

export const categoryDef = parser => {
  if (!parser.expect('expected new category name', tokenType.text)) return undefined
  const name = new Node(nodeType.categoryName, parser.advance().content)
  if (!parser.expect('expected equals sign', tokenType.equals)) return undefined
  parser.advance()
  const predicate = categoryDefPredicate(parser)
  return new Tree(nodeType.categoryDef, [name, predicate])
}

export const temporaryCategory = parser => {
  if (!parser.expect('expected opening brace', tokenType.leftbrace)) return undefined
  parser.advance()
  if (!parser.expect('expected temporary category content', tokenType.text)) return undefined
  const predicate = categoryDefPredicate(parser)
  if (!parser.expect('expected closing brace', tokenType.rightbrace)) return undefined
  parser.advance()
  if (!predicate) return undefined
  return new Tree(nodeType.temporaryCategory, predicate.children)
}
