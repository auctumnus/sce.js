const test = require('ava')

const sce = require('../dist/scejs.cjs')

test('puts text characters together', t => {
  t.deepEqual(scejs.tokenizer.tokenize('aaa'), [new sce.tokenizer.Token('text', 'aaa')])
})

test('recognizes all reserved characters', t => {
  for (const [char, type] of Object.entries(sce.tokenizer.charToType)) {
    t.deepEqual(sce.tokenizer.tokenize(char), [new sce.tokenizer.Token(type, char)])
  }
})

test('correctly tokenizes a simple rule', t => {
  /* a > b / c */
  const expected = [
    new sce.tokenizer.Token('text', 'a'),
    new sce.tokenizer.Token('whitespace', ' '),
    new sce.tokenizer.Token('angleBracketRight', '>'),
    new sce.tokenizer.Token('whitespace', ' '),
    new sce.tokenizer.Token('text', 'b'),
    new sce.tokenizer.Token('whitespace', ' '),
    new sce.tokenizer.Token('slash', '/'),
    new sce.tokenizer.Token('whitespace', ' '),
    new sce.tokenizer.Token('text', 'c')
  ]
  t.deepEqual(sce.tokenizer.tokenize('a > b / c'), expected)
})

test('handles newlines', t => {
  /* a
     b */
  const expected = [
    new sce.tokenizer.Token('text', 'a'),
    new sce.tokenizer.Token('newline', '\n'),
    new sce.tokenizer.Token('text', 'b')
  ]
  t.deepEqual(sce.tokenizer.tokenize('a\nb'), expected)
})

test('recognizes non-ascii characters', t => {
  t.deepEqual(sce.tokenizer.tokenize('é'), [new sce.tokenizer.Token('text', 'é')])
})
