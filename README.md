# tap-monkey

## 🍌️🐒️

A [tap]() formatter that’s also a monkey.

Use it like [tap-spec]() for running regular tests and also like [tap-nyc]() for running coverage with [c8]() or [nyc]().

## Install

```sh
npm i @small-tech/tap-monkey
```

## Use

Pipe your tap test output to tap-monkey (e.g., if your _test.js_ file contains [tape]() test):

```sh
node test.js | npx tap-monkey
```

Or, as a test task in your _package.json_ file:

```json
"scripts" : [
  "test": "node test.js | tap-monkey"
]
```

Or, if you have more than one test file:

```json
"scripts" : [
  "test": "tape test/**/*js | tap-monkey"
]
```

Or, if you want to run code coverage (e.g., using [c8]()):

```json
"scripts" : [
  "test": "c8 tape test/**/*js | tap-monkey"
]
```
