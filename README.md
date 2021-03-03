# Tap Monkey

## 🍌️🐒️

![Screencast of Tap Monkey in action. Terminal window. Command: npm -s test. Progress of tests being run is shown by a single-line animation of the emoji monkey heads alternating between see no evil, hear no evil, speak no evil poses as the titles of test collections being run and passing tests are shown alongside. At the end, an emoji banana is shown next to “All tests passing. Total: 163. Passing 163. Failing 0. Duration 14.19 secs.](https://small-tech.org/images/tap-monkey.gif)

A [tap](https://testanything.org/) formatter that’s also a monkey.

Displays test runner status using a static single-line spinner (hint: it’s a monkey) and only fills your screen with text on failures and with your coverage report.

Use it like [tap-spec](https://github.com/scottcorgan/tap-spec) for running regular tests and also like [tap-nyc](https://github.com/MegaArman/tap-nyc) for running coverage with [c8](https://github.com/bcoe/c8) or [nyc](https://github.com/istanbuljs/nyc).

## Install

```sh
npm i @small-tech/tap-monkey
```

## Use

Pipe your tap test output to tap-monkey (e.g., if your _test.js_ file contains [tape](https://github.com/substack/tape) tests):

```sh
node test.js | npx tap-monkey
```

Or, as a test task in your _package.json_ file:

```json
"scripts" : {
  "test": "node test.js | tap-monkey"
}
```

Or, if you have more than one test file:

```json
"scripts" : {
  "test": "tape test/**/*js | tap-monkey"
}
```

## Accessibility

For a quieter monkey, use the `--quiet` flag. e.g.,

```json
"scripts" : {
  "test": "tape test/**/*js | tap-monkey --quiet"
}
```

When this flag is passed, only an initial notice is shown that tests are running and no futher updates are given unless there are failures or until the final summary and/or coverage report are shown.

This is a general accessibility and usability feature. It might help folks using assistive devices like screen readers who might otherwise get overwhelmed by notifications of running/passing tests as well as anyone else who wants a generally calmer monkey.

## Code coverage

![Screenshot of Tap Monkey running coverage with a lovely coverage report surrounded by a single-line border with rounded corners drawn using box drawing characters.](https://small-tech.org/images/tap-monkey-coverage.png)

Use Tap Monkey for code coverage in exactly the same way as you do for your tests.

e.g., using [c8](https://github.com/bcoe/c8):

```json
"scripts" : {
  "test": "c8 tape test/**/*js | tap-monkey"
}
```

## Test failures

![Screenshot of Tap Monkey showing a failed test. Full test details, including a stack trace are shown. At the end are the aggregate statistics.](https://small-tech.org/images/tap-monkey-failed-test.png)

While passing tests are displayed ephemerally in the status line so as not to fill up your terminal window with unnecessary information, failed tests are always written in full to the terminal.

(When running tests, we don’t care about passing tests, only failing ones.)

## Like this? Fund us!

[Small Technology Foundation](https://small-tech.org) is a tiny, independent not-for-profit.

We exist in part thanks to patronage by people like you. If you share [our vision](https://small-tech.org/about/#small-technology) and want to support our work, please [become a patron or donate to us](https://small-tech.org/fund-us) today and help us continue to exist.

## Copyright

&copy; 2021 [Aral Balkan](https://ar.al), [Small Technology Foundation](https://small-tech.org).

## License

ISC
