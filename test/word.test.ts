import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { Word } from '../src'

test('basic parse', () => {
  assert.is(Word.parse('abc').toString(), 'abc')
})

test('unnecessary separator', () => {
  assert.is(Word.parse("a'bc", [], "'").toString(), 'abc')
})

test('graphs not in word', () => {
  assert.is(Word.parse('abc', ['ph', 'th', 'kh'], "'").toString(), 'abc')
})

test('polygraphs', () => {
  const graphs = ['ch', 'sh', 'ts', 'tsh']

  assert.is(Word.parse('achu', graphs, "'").toString(), 'achu')
  assert.is(Word.parse("ats'hu", graphs, "'").toString(), "ats'hu")
})

test('polygraphs internal length', () => {
  assert.is(Word.parse('achu', ['ch']).phones.length, 5)
})

test('kat polygraphs', () =>
  ["a'b'c", "ab'c", "a'bc", 'abc'].forEach((w) =>
    assert.is(
      Word.parse(w, ['a', 'b', 'c', 'ab', 'bc', 'abc'], "'").toString(),
      w
    )
  ))

test('internal whitespace', () =>
  assert.is(Word.parse('a b').toString(), 'a b'))

test.run()
