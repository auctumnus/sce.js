import { tokenType } from '../scanner'
import { Tree, Node, nodeType } from './node'

const binaryFlag = parser => {
  if (!parser.expect('expected flag', tokenType.text)) return undefined
  const content = parser.advance().content
  if (content === 'ignore' || content === 'rtl') {
    return new Node(nodeType.binaryFlag, content)
  } else {
    parser.error('expected one of "ignore" or "rtl"')
    parser.toLineEnd()
    return undefined
  }
}

const ternaryFlag = parser => {
  if (!parser.expect('expected flag', tokenType.exclamation,
    tokenType.text)) return undefined
  let content = ''
  if (parser.match(tokenType.exclamation)) {
    content += '!'
    parser.advance()
  }
  if (!parser.expect('expected one of "ditto" or "stop"', tokenType.text)) return undefined

  const textContent = parser.advance().content
  if (textContent === 'ditto' || textContent === 'stop') {
    return new Node(nodeType.ternaryFlag, content + textContent)
  } else {
    parser.error('expected one of "ditto" or "stop"')
    parser.toLineEnd()
    return undefined
  }
}

const numericFlag = parser => {
  if (!parser.expect('expected flag', tokenType.text)) return undefined
  let flag = parser.advance().content
  if (flag === 'repeat:' || flag === 'persist:' || flag === 'chance:') {
    // remove colon at end
    flag = flag.slice(0, flag.length - 1)
    if (!parser.expect('expected number', tokenType.number)) return undefined
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
    return new Node(nodeType.numericFlag, { flag, number })
  } else {
    parser.error('expected one of "repeat" or "persist" or "chance"')
    parser.toLineEnd()
    return undefined
  }
}

const flag = parser => {
  if (parser.match(tokenType.exclamation)) {
    return parser.ternaryFlag()
  } else if (parser.match(tokenType.text)) {
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

export const flagList = parser => {
  const flagFn = () => flag(parser)
  return parser.options(nodeType.flagList, flagFn, tokenType.semicolon)
}