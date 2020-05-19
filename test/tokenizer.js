const test = require('ava')

const scejs = require('../dist/scejs.cjs')

test('puts text characters together', t => {
  t.deepEqual(scejs.tokenizer.tokenize('aaa'), [new scejs.tokenizer.Token('text', 'aaa')])
})

test('recognizes all reserved characters', t => {
  for (const [char, type] of Object.entries(scejs.tokenizer.charToType)) {
    t.deepEqual(scejs.tokenizer.tokenize(char), [new scejs.tokenizer.Token(type, char)])
  }
})

test('correctly tokenizes a simple rule', t => {
  /* a > b / c */
  const expected = [
    new scejs.tokenizer.Token('text', 'a'),
    new scejs.tokenizer.Token('whitespace', ' '),
    new scejs.tokenizer.Token('angleBracketRight', '>'),
    new scejs.tokenizer.Token('whitespace', ' '),
    new scejs.tokenizer.Token('text', 'b'),
    new scejs.tokenizer.Token('whitespace', ' '),
    new scejs.tokenizer.Token('slash', '/'),
    new scejs.tokenizer.Token('whitespace', ' '),
    new scejs.tokenizer.Token('text', 'c')
  ]
  t.deepEqual(scejs.tokenizer.tokenize('a > b / c'), expected)
})

test('handles newlines', t => {
  /* a
     b */
  const expected = [
    new scejs.tokenizer.Token('text', 'a'),
    new scejs.tokenizer.Token('newline', '\n'),
    new scejs.tokenizer.Token('text', 'b')
  ]
  t.deepEqual(scejs.tokenizer.tokenize('a\nb'), expected)
})

test('recognizes non-ascii characters', t => {
  t.deepEqual(scejs.tokenizer.tokenize('é'), [new scejs.tokenizer.Token('text', 'é')])
})
