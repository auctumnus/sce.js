const test = require('ava')

const { Scanner, Token, tokenType } = require('../dist/scejs.cjs')

const simpleMap = {
  '(': 'leftparen',
  ')': 'rightparen',
  '[': 'leftbrace',
  ']': 'rightbrace',
  '{': 'leftcurly',
  '}': 'rightcurly',
  '"': 'quote',
  '%': 'percent',
  _: 'underscore',
  '~': 'tilde',
  '@': 'at',
  '!': 'exclamation',
  '?': 'question',
  '+': 'plus'
}

test('puts text characters together', t => {
  t.deepEqual(new Scanner('aaa').scanTokens()[0], new Token(tokenType.text, 'aaa', 1))
})

test('recognizes all reserved characters', t => {
  for (const [char, type] of Object.entries(simpleMap)) {
    t.deepEqual(new Scanner(char).scanTokens()[0], new Token(tokenType[type], char, 1))
  }
})

test('correctly tokenizes a simple rule', t => {
  /* a > b / c */
  const expected = [
    new Token(tokenType.text, 'a', 1),
    new Token(tokenType.angleBracketRight, '>', 1),
    new Token(tokenType.text, 'b', 1),
    new Token(tokenType.slash, '/', 1),
    new Token(tokenType.text, 'c', 1),
    new Token(tokenType.eof, '', 1)
  ]
  t.deepEqual(new Scanner('a > b / c').scanTokens(), expected)
})

test('handles newlines', t => {
  /* a
     b */
  const expected = [
    new Token(tokenType.text, 'a', 1),
    new Token(tokenType.newline, '\n', 1),
    new Token(tokenType.text, 'b', 2),
    new Token(tokenType.eof, '', 2)
  ]
  t.deepEqual(new Scanner('a\nb').scanTokens(), expected)
})

test('recognizes non-ascii characters', t => {
  t.deepEqual(new Scanner('é').scanTokens()[0], new Token(tokenType.text, 'é', 1))
})
