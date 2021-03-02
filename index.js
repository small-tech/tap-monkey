#!/usr/bin/env node

import Ora from 'ora'
import chalk from 'chalk'
import { performance } from 'perf_hooks'
import tapOut from '@small-tech/tap-out'

let hasFailures = false

const indentedMonkey = {
  "interval": 300,
  "frames": [
    "  🙈 ",
    "  🙈 ",
    "  🙉 ",
    "  🙊 "
  ]
}

const spinner = new Ora({
    spinner: indentedMonkey,
    discardStdin: false,
    text: 'Running tests'
})

const parser = tapOut()
process.stdin.pipe(parser)

const startTime = performance.now()

let printingCoverage = false
let coverageBorderCount = 0
let currentTest = ''
let testStatusNoticePrinted = false

// Only print coverage unless there’s an error.
parser.on('test', test => {
  spinner.start()

  currentTest = test.name
  spinner.text = `Running ${chalk.underline(currentTest)} tests`
})

parser.on('assert', assert => {
  // spinner.text = `Running ${chalk.underline(currentTest)} tests (${assert.number})`
})

parser.on('pass', assert => {
  spinner.text = `${chalk.green('✔')} ${assert.name}`
})

parser.on('fail', assert => {
  hasFailures = true
  spinner.stop()

  const e = assert.error

  console.log(`${chalk.red('✖ FAIL:')} ${assert.name} \n`)

  if (e.operator !== undefined) console.log(`  operator:`, e.operator)
  if (e.expected !== undefined) console.log(`  ${chalk.green(`expected: ${e.expected}`)}`)
  if (e.actual !== undefined)   console.log(`  ${chalk.red(`actual  : ${e.actual}`)}`)
  if (e.at !== undefined)       console.log(`  ${chalk.yellow(`at      : ${e.at}`)}`)

  console.log()

  e.stack.split('\n').forEach(line => {
    console.log(' ', chalk.gray(line))
  })

  spinner.start()
})

parser.on('comment', comment => {
  let commentText = comment.raw
  if (!printingCoverage) {
    printingCoverage = true
    spinner.stop()
  }

  if (commentText.startsWith('----')) {
    coverageBorderCount++
    switch(coverageBorderCount) {
      case 1: commentText = `╭─${commentText.replace(/\-\|\-/g, '─┬─')}─╮`; break
      case 2: commentText = `├─${commentText.replace(/\-\|\-/g, '─┼─')}─┤`; break
      case 3: commentText = `╰─${commentText.replace(/\-\|\-/g, '─┴─')}─╯\n`; break
      default: throw new Error('Too many borders found in coverage. Panic!')
    }
  } else {
    commentText = `│ ${commentText} │`
  }

  console.log(commentText.replace(/\|/g, '│').replace(/\-/g, '─'))
})

parser.on('output', results => {
  const duration = ((performance.now() - startTime)/1000).toFixed(2)
  spinner.stop()

  const total = results.asserts.length
  const passing = results.pass.length
  const failing = results.fail.length

  if (hasFailures) {
    console.log(`  🙊️ ${chalk.magenta('There are failed tests.')}`)
  } else {
    console.log(`  🍌️ ${chalk.green('All tests passing!')}`)
  }

  console.log()
  console.log(            `  Total     ${total}`)
  console.log(chalk.green(`  Passing   ${passing}`))
  console.log(chalk.red(  `  Failing   ${failing}`))
  console.log(chalk.gray( `  Duration  ${duration} secs`))
})
