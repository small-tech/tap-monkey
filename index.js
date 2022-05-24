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
import os from 'os'

let hasFailures = false

// The formatter has a --quiet option that stops status updates being
// printed until there is a failure or until the aggregate statistics is
// being shown. People using screen readers and other assistive technologies
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

const passHandler = (assert => {
  if (!quiet) {
    spinner.text = `${chalk.green('✔')} ${assert.name}`
  }
})

const testHandler = (test => {
  spinner.start()
  if (!quiet) {
    currentTest = test.name
    spinner.text = `Running ${chalk.underline(currentTest)} tests`
  }
})

const failHandler = (assert => {
  // Stop the spinner and output failures in full.
  hasFailures = true
  spinner.stop()

  const e = assert.error

  console.log(`${chalk.red('✖ FAIL:')} ${assert.name} \n`)

  if (e.operator !== undefined) console.log(`  operator:`, e.operator)
  if (e.expected !== undefined) console.log(`  ${chalk.green(`expected: ${e.expected}`)}`)
  if (e.actual !== undefined)   console.log(`  ${chalk.red(`actual  : ${e.actual}`)}`)
  if (e.at !== undefined)       console.log(`  ${chalk.yellow(`at      : ${e.at.file.replace(os.homedir(), '~')}:${e.at.line}:${e.at.character}`)}`)

  console.log()

  e.stack.split('\n').forEach(line => {
    console.log(' ', chalk.red(line))
  })

  spinner.start()
})

const bailOutHandler = (event => {
  // If the test runner has emitted a bail out event, it has signaled
  // that it cannot continue. So we notify the person and exit.
  spinner.stop()
  console.error(chalk.red(event.raw))
  console.error()
  process.exit(1)
})

const commentHandler = (comment => {
  spinner.stop()
  let commentText = comment.raw
  
  const isCoverageBorder = commentText.startsWith('----')
  if (isCoverageBorder) { printingCoverage = true }

  if (printingCoverage) {
    if (isCoverageBorder) {
      coverageBorderCount++
      switch(coverageBorderCount) {
        case 1: commentText = `╭─${commentText.replace(/\-\|\-/g, '─┬─')}─╮`; break
        case 2: commentText = `├─${commentText.replace(/\-\|\-/g, '─┼─')}─┤`; break
        case 3: commentText = `╰─${commentText.replace(/\-\|\-/g, '─┴─')}─╯\n`; break
        default: throw new Error('Too many borders found in coverage. Panic!')
      }
    } else {
      // Printing coverage but this line isn’t a border, just surround it with vertical borders.
      commentText = `│ ${commentText} │`
    }
    // Replace any inner borders that there might be with proper box-drawing characters.
    console.log(commentText.replace(/\|/g, '│').replace(/\-/g, '─'))
  } else {
    // We aren’t printing coverage yet so this must be a regular TAP comment.
    // Display it fully.
    console.log(chalk.yellow('   🢂 '), commentText.trim())
    spinner.start()
  }
})

const outputHandler = (results => {
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

parser.on('test', testHandler)
parser.on('pass', passHandler)
parser.on('fail', failHandler)
parser.on('bailOut', bailOutHandler)
parser.on('comment', commentHandler)
parser.on('output', outputHandler)

export default { testHandler, passHandler, failHandler, bailOutHandler, commentHandler, outputHandler, parser, spinner, quiet }
