import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { Category } from '../src/category'

test('category creation', () => {
  const cat = new Category(['a', 'b', 'c'], 'a')
  assert.is(cat.elements.length, 3)
  assert.is(cat.name, 'a')
})

test('category.has', () => {
  const cat = new Category(['a', 'b', 'c'], 'a')
  assert.ok(cat.has('c'))
})

test('category.toString', () => {
  const cat = new Category(['a', 'b', 'c'], 'a')
  assert.is(cat + '', `Category "a": a, b, c`)
})

test('anonymous category.toString', () => {
  const cat = new Category(['a', 'b', 'c'])
  assert.is(cat + '', `Anonymous category: a, b, c`)
})

test.run()
