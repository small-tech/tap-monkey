#!/usr/bin/env node

//////////////////////////////////////////////////////////////////////////////////////////
//
// A tap formatter that’s also a monkey.
//
// Displays test runner status using a static single-line spinner (hint: it’s a monkey)
// and only fills your screen with text on failures and with your coverage report.
//
// Copyright ⓒ 2021 Aral Balkan, Small Technology Foundation
// License: ISC
//
//////////////////////////////////////////////////////////////////////////////////////////

import Ora from 'ora'
import chalk from 'chalk'
import { performance } from 'perf_hooks'
import tapOut from '@small-tech/tap-out'

let hasFailures = false

// The formatter has a --quiet option that stops status updates being
// printed until there is a failure or until the aggregate statistics is
// being shown. People using screenreaders and other assistive technologies
// might want to use this if the number of status updates becomes overwhelming.
let quiet = (process.argv.length === 3 && process.argv[2] === '--quiet')

// Due to the 300ms frame duration of the monkey animation, not every
// status update we receive about new test suites and test passes will be
// reflected in the spinner text and that’s ok. Failures, of course, are
// all output in full to the terminal.
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
    text: 'Running tests…'
})

const parser = tapOut()
process.stdin.pipe(parser)

const startTime = performance.now()

let printingCoverage = false
let coverageBorderCount = 0
let currentTest = ''

parser.on('test', test => {
  spinner.start()
  if (!quiet) {
    currentTest = test.name
    spinner.text = `Running ${chalk.underline(currentTest)} tests`
  }
})

parser.on('pass', assert => {
  if (!quiet) {
    spinner.text = `${chalk.green('✔')} ${assert.name}`
  }
})

parser.on('fail', assert => {
  // Stop the spinner and output failures in full.
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

  if (commentText.startsWith('----')) {
    // We take the first comment that includes a border to signal the
    // start of the coverage section and stop the spinner permanently
    // from there on.
    if (!printingCoverage) {
      printingCoverage = true
      spinner.stop()
    }

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

  if (printingCoverage) {
    console.log(commentText.replace(/\|/g, '│').replace(/\-/g, '─'))
  } else {
    // We haven’t started printing coverage yet so this must be some other TAP comment.
    // Display it in the status line.
    spinner.text = commentText
  }
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
