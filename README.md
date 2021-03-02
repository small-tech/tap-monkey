# tap-monkey

## 🍌️🐒️

<img src='https://small-tech.org/images/tap-monkey.gif' width='807px'>

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

Or, if you want to run code coverage (e.g., using [c8]()):

```json
"scripts" : {
  "test": "c8 tape test/**/*js | tap-monkey"
}
```

## Like this? Fund us!

[Small Technology Foundation](https://small-tech.org) is a tiny, independent not-for-profit.

We exist in part thanks to patronage by people like you. If you share [our vision](https://small-tech.org/about/#small-technology) and want to support our work, please [become a patron or donate to us](https://small-tech.org/fund-us) today and help us continue to exist.

## Copyright

&copy; 2021 [Aral Balkan](https://ar.al), [Small Technology Foundation](https://small-tech.org).

## License

ISC
