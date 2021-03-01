import ora from 'ora'
import { performance } from 'perf_hooks'
import tapOut from '@small-tech/tap-out'

const spinner = ora('Running tests').start({
  discardStdin: false,
})

const parser = tapOut()
process.stdin.pipe(parser)

const startTime = performance.now()

let printingCoverage = false
let currentTest = ''

// Only print coverage unless there’s an error.
parser.on('test', test => {
  currentTest = test.name
  spinner.text = currentTest
})

parser.on('assert', assert => {
  spinner.text = `${currentTest} (${assert.number})`
})

parser.on('fail', assert => {
  spinner.stop()

  console.log(`Test #${assert.name} failed.\n`)
  console.log(assert.raw)

  spinner.start()
})

parser.on('comment', comment => {
  if (!printingCoverage) {
    printingCoverage = true
    spinner.succeed('Tests complete.\n\nCoverage:\n')
  }
  console.log(comment.raw)
})

parser.on('output', results => {
  const duration = ((performance.now() - startTime)/1000).toFixed(2)
  spinner.stop()

  console.log()
  console.log(`total: ${results.asserts.length}`)
  console.log(`passing: ${results.pass.length}`)
  console.log(`failing: ${results.fail.length}`)
  console.log(`duration: ${duration} secs`)
})
