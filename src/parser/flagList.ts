import { Tokens } from '../scanner'
import { Node, Nodes } from './node'
import { Parser } from './parser'

const binaryFlag = (parser: Parser) => {
  if (!parser.expect('expected flag', Tokens.text)) return undefined
  const content = parser.advance().content
  if (content === 'ignore' || content === 'rtl') {
    return new Node(Nodes.binaryFlag, content)
  } else {
    parser.error('expected one of "ignore" or "rtl"')
    parser.toLineEnd()
    return undefined
  }
}

const ternaryFlag = (parser: Parser) => {
  if (!parser.expect('expected flag', Tokens.exclamation,
    Tokens.text)) return undefined
  let content = ''
  if (parser.match(Tokens.exclamation)) {
    content += '!'
    parser.advance()
  }
  if (!parser.expect('expected one of "ditto" or "stop"', Tokens.text)) return undefined

  const textContent = parser.advance().content
  if (textContent === 'ditto' || textContent === 'stop') {
    return new Node(Nodes.ternaryFlag, content + textContent)
  } else {
    parser.error('expected one of "ditto" or "stop"')
    parser.toLineEnd()
    return undefined
  }
}

const numericFlag = (parser: Parser) => {
  if (!parser.expect('expected flag', Tokens.text)) return undefined
  let flag = parser.advance().content
  if (flag === 'repeat:' || flag === 'persist:' || flag === 'chance:') {
    // remove colon at end
    flag = flag.slice(0, flag.length - 1)
    if (!parser.expect('expected number', Tokens.number)) return undefined
    const number = parser.advance().content
    // according to SCE docs, repeat and persist have a max of 1000 and a
    // minimum of 1
    if ((flag !== 'chance') && (number < 1 || number > 1000)) {
      parser.error('number must be between 1 and 1000')
      parser.toLineEnd()
      return undefined
    }
    // chance has a lower max value at 100 (for 100%)
    if ((flag === 'chance') && (number < 1 || number > 100)) {
      parser.error('number must be between 1 and 100')
      parser.toLineEnd()
      return undefined
    }
    let type: Nodes
    switch (flag) {
      case 'repeat:': {
        type = Nodes.repeatFlag
        break
      }
      case 'persist:': {
        type = Nodes.persistFlag
        break
      }
      case 'chance:': {
        type = Nodes.chanceFlag
        break
      }
    }
    return new Node(type, number)
  } else {
    parser.error('expected one of "repeat" or "persist" or "chance"')
    parser.toLineEnd()
    return undefined
  }
}

const flag = (parser: Parser) => {
  if (parser.match(Tokens.exclamation)) {
    return ternaryFlag(parser)
  } else if (parser.match(Tokens.text)) {
    switch (parser.peek().content) {
      case 'ignore': case 'rtl': {
        return binaryFlag(parser)
      }
      case 'ditto': case 'stop': {
        return ternaryFlag(parser)
      }
      case 'repeat:': case 'persist:': case 'chance:': {
        return numericFlag(parser)
      }
      default: {
        parser.error('expected flag')
        parser.toLineEnd()
        return undefined
      }
    }
  } else {
    parser.error('expected flag')
    parser.toLineEnd()
    return undefined
  }
}

export const flagList = (parser: Parser) => {
  const flagFn = () => flag(parser)
  return parser.options(Nodes.flagList, flagFn, Tokens.semicolon)
}
