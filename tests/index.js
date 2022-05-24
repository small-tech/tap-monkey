import test from 'tape'
import tapMonkey from '../index.js'
import assert from 'assert'
import strip from 'strip-ansi'

// Since Tap Monkey pipes stdin, this will leave a handle open.
// We have to destroy stdin when all tests are done for the 
// runner to exit properly.
// See https://github.com/nodejs/node/issues/32291

test.onFinish(() => {
  process.stdin.destroy()
})

//
// Test handler and general tests.
//

test('test handler', t => {
  // Setup.
  tapMonkey.quiet = false
  tapMonkey.testHandler({name: 'mock'})
  tapMonkey.spinner.stop()

  // First, a few general tests.
  t.strictEquals(tapMonkey.spinner._spinner.interval, 300, 'spinner interval is as expected')
  t.strictEquals(tapMonkey.spinner._spinner.frames[0], '  🙈 ', 'animation frame 1 is correct')
  t.strictEquals(tapMonkey.spinner._spinner.frames[1], '  🙈 ', 'animation frame 2 is correct')
  t.strictEquals(tapMonkey.spinner._spinner.frames[2], '  🙉 ', 'animation frame 3 is correct')
  t.strictEquals(tapMonkey.spinner._spinner.frames[3], '  🙊 ', 'animation frame 4 is correct')

  // Then the testHandler() test.
  t.true(strip(tapMonkey.spinner.text).includes('Running mock tests'), 'test name is displayed correctly')
  
  t.end()
})

//
// Fail handler tests.
//

test('fail handler', t => {
  // Capture console log temporarily.
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

  t.true(output[0].includes('TypeError: Cannot convert undefined or null to object'), 'output includes main error message')
  t.true(output[2].includes('~/Projects/nodekit/node_modules/tape-promise/node_modules/onetime/index.js:30:12'), 'error location shown')

  t.end()
})

//
// Bail out handler tests.
//

// TODO

//
// Comment handler tests.
//

//
// Output handler tests.
//

// TODO

// console.log('All tests passed.')
// process.exit()

