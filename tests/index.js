import test from 'tape'
import tapMonkey from '../index.js'
import { context } from '../index.js'
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
  context.quiet = false
  tapMonkey.testHandler({name: 'mock'})
  tapMonkey.spinner.stop()

  t.strictEquals(tapMonkey.spinner._spinner.interval, 300, 'spinner interval is as expected')
  t.strictEquals(tapMonkey.spinner._spinner.frames[0], '  🙈 ', 'animation frame 1 is correct')
  t.strictEquals(tapMonkey.spinner._spinner.frames[1], '  🙈 ', 'animation frame 2 is correct')
  t.strictEquals(tapMonkey.spinner._spinner.frames[2], '  🙉 ', 'animation frame 3 is correct')
  t.strictEquals(tapMonkey.spinner._spinner.frames[3], '  🙊 ', 'animation frame 4 is correct')

  t.true(strip(tapMonkey.spinner.text).includes('Running mock tests'), 'test name is displayed correctly')
  
  context.quiet = true
  tapMonkey.testHandler({name: 'quiet mock'})
  tapMonkey.spinner.stop()
  
  t.false(strip(tapMonkey.spinner.text).includes('Running quiet mock tests'), 'test name not displayed in quiet mode')
    
  t.end()
})

//
// Pass handler tests.
//

test('pass handler', t => {
  // Quiet passes (the default)
  context.quiet = true
  const quietPass = 'a quiet pass'
  tapMonkey.passHandler({ name: quietPass })
  t.false(tapMonkey.spinner.text.includes(quietPass), 'quiet mode should not display passed tests')
  
  // Loud passes.
  context.quiet = false
  const loudPass = 'a loud pass'
  tapMonkey.passHandler({ name: loudPass })
  t.true(tapMonkey.spinner.text.includes(loudPass), 'passed tests should display when quiet mode is off')
  
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

test('bailout handler', t => {
  // Setup.
  const _error = console.error
  let output = ''
  console.error = string => output += string
  
  const _exit = process.exit
  let exitCalledWithCorrectCode = false
  process.exit = code => exitCalledWithCorrectCode = code === 1

  // Test.
  tapMonkey.spinner.start()
  const mockRaw = 'mock raw event contents'
  tapMonkey.bailOutHandler({ raw: mockRaw })
  
  t.strictEquals(tapMonkey.spinner.isSpinning, false, 'spinner has stopped')
  t.true(output.includes(mockRaw), 'output includes mock event raw string')
  t.true(exitCalledWithCorrectCode, 'exit is called')
  
  // Tear down.
  console.error = _error
  process.exit = _exit
  
  t.end()
})

//
// Comment handler tests.
//

test('comment handler', t => {
  // Setup.
  const originalConsoleLog = console.log
  const capturedConsoleLog = (...args) => output += args.join(' ')

  console.log = capturedConsoleLog
  let output = ''

  // Test regular comment.
  const regularCommentPrefix = '   🢂 '
  const regularComment = 'a regular comment'

  tapMonkey.commentHandler({ raw: regularComment })
  tapMonkey.spinner.stop()
  console.log = originalConsoleLog

  t.equals(output, `${regularCommentPrefix} ${regularComment}`, 'regular comment is formatted correctly')
  
  // Test coverage comments.
  output = ''
  console.log = capturedConsoleLog
  
  const coverageTap = [
    '----------|---------|----------|---------|---------|-----------------------',
    '   File   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s     ',
    '----------|---------|----------|---------|---------|-----------------------',
    'All files |   70.37 |    71.42 |      50 |   70.37 |                       ',
    ' index.js |   70.37 |    71.42 |      50 |   70.37 | 59-61,105-131,135-152 ',
    '----------|---------|----------|---------|---------|-----------------------'
  ]
  
  const expectedCoverageOutput = '╭───────────┬─────────┬──────────┬─────────┬─────────┬────────────────────────╮│    File   │ % Stmts │ % Branch │ % Funcs │ % Lines │ Uncovered Line #s      │├───────────┼─────────┼──────────┼─────────┼─────────┼────────────────────────┤│ All files │   70.37 │    71.42 │      50 │   70.37 │                        ││  index.js │   70.37 │    71.42 │      50 │   70.37 │ 59─61,105─131,135─152  │╰───────────┴─────────┴──────────┴─────────┴─────────┴────────────────────────╯'
  
  coverageTap.forEach(line => {
    tapMonkey.commentHandler({ raw: line })
  })
  tapMonkey.spinner.stop()
  console.log = originalConsoleLog
  
  // Assertions.
  t.equals(output.trim(), expectedCoverageOutput, 'formatted coverage output is correct')
  
  t.end()
})

//
// Output handler tests.
//

test ('output handler', t => {
  const vacuumPack = string => string.replace(/\s/g, '')
  const originalConsoleLog = console.log
  const capturedConsoleLog = (...args) => output += args.join(' ')

  console.log = capturedConsoleLog
  let output = ''
  
  // Test: all tests passing.

  const mockAllTestsPassingResults = {
    asserts: [1, 2, 3],
    pass: [1, 2, 3],
    fail: [] 
  }  

  tapMonkey.outputHandler(mockAllTestsPassingResults)
  console.log = originalConsoleLog

  t.strictEquals(tapMonkey.spinner.isSpinning, false, 'spinner has stopped')
  t.true(vacuumPack(output).includes('Alltestspassing!Total3Passing3Failing0'))
  
  // Test: failing tests.
  
  output = ''
  console.log = capturedConsoleLog
  
  const mockFailingTests = {
    asserts: [1, 2, 3],
    pass: [1],
    fail: [2, 3] 
  }
  
  tapMonkey.outputHandler(mockFailingTests)
  console.log = originalConsoleLog
  
  t.true(vacuumPack(output).includes('Therearefailedtests.Total3Passing1Failing2'))
  t.end()
})

