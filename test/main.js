const test = require('ava')

const sce = require('../dist/scejs.cjs')
const pkg = require('../package.json')

test('returns the current version', t => {
  t.is(sce.getVersion(), pkg.version)
})
