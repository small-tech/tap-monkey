import tapMonkey from '../index.js'
import assert from 'assert'
import strip from 'strip-ansi'

//
// Test handler tests
//

tapMonkey.quiet = false
tapMonkey.testHandler({name: 'mock'})
tapMonkey.spinner.stop()

// First, a few general tests.
assert(tapMonkey.spinner._spinner.interval === 300, 'spinner interval is as expected')
assert(tapMonkey.spinner._spinner.frames[0] === '  🙈 ', 'animation frame 1 is correct')
assert(tapMonkey.spinner._spinner.frames[1] === '  🙈 ', 'animation frame 2 is correct')
assert(tapMonkey.spinner._spinner.frames[2] === '  🙉 ', 'animation frame 3 is correct')
assert(tapMonkey.spinner._spinner.frames[3] === '  🙊 ', 'animation frame 4 is correct')

// Then the testHandler() test.
assert(strip(tapMonkey.spinner.text).includes('Running mock tests'), 'test name is displayed correctly')

//
// Fail handler tests.
//

const _log = console.log
const output = []
console.log = string => {
  output.push(string)
}

const mockAssert = {
  type: 'assert',
  raw: 'not ok 2 TypeError: Cannot convert undefined or null to object',
  ok: false,
  number: 2,
  name: 'TypeError: Cannot convert undefined or null to object',
  error: {
    operator: 'error',
    expected: undefined,
    actual: undefined,
    at: {
      file: '/var/home/aral/Projects/nodekit/node_modules/tape-promise/node_modules/onetime/index.js',
      line: '30',
      character: '12'
    },
    stack: 'TypeError: Cannot convert undefined or null to object\n' +
      'at Function.keys (<anonymous>)\n' +
      'at sortResults (file:///var/home/aral/Projects/nodekit/tests/files.js:17:10)\n' +
      'at file:///var/home/aral/Projects/nodekit/tests/files.js:101:58\n' +
      'at processTicksAndRejections (node:internal/process/task_queues:96:5)\n',
    raw: '    operator: error\n' +
      '    at: bound (/var/home/aral/Projects/nodekit/node_modules/tape-promise/node_modules/onetime/index.js:30:12)\n' +
      '    stack: |-\n' +
      'TypeError: Cannot convert undefined or null to object\n' +
      'at Function.keys (<anonymous>)\n' +
      'at sortResults (file:///var/home/aral/Projects/nodekit/tests/files.js:17:10)\n' +
      'at file:///var/home/aral/Projects/nodekit/tests/files.js:101:58\n' +
      'at processTicksAndRejections (node:internal/process/task_queues:96:5)'
  },
  test: 10
}

tapMonkey.failHandler(mockAssert)
tapMonkey.spinner.stop()
console.log = _log

assert(output[0].includes('TypeError: Cannot convert undefined or null to object'), 'output includes main error message')
assert(output[2].includes('~/Projects/nodekit/node_modules/tape-promise/node_modules/onetime/index.js:30:12'), 'error location shown')

console.log('All tests passed.')
process.exit()

