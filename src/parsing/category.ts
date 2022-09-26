import { Parser } from './parser'

export const parseCategoryReference = (parser: Parser) => {
  if (parser.peek() === '[') {
    parser.next()
    parser.startSpan()
    parser.skip((c) => c !== ']' && c !== ',')
    if (parser.peek() === ']') {
      parser.next()
      const span = parser.endSpan()
      const content = span + ''
    } else if (parser.peek() === ',') {
      // oops, this isn't a category reference, this is ~~a bathtub~~
      // a temporary category!
      // TODO: handle this ig lol
      throw new Error()
    } else {
      return null
    }
  } else {
    return null
  }
}

export const parseCategory = (parser: Parser) => {}
