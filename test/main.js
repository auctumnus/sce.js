const test = require('ava')

const scejs = require('../dist/scejs.cjs')
const pkg = require('../package.json')

test('returns the current version', t => {
  t.is(scejs.getVersion(), pkg.version)
})
