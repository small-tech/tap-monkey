# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2022-05-24

Testy monkey.

## Added

  - 100% code coverage. Now using tape and *drumroll* Tap Monkey itself for the tests.

## [1.3.0] - 2021-03-05

Debug monkey.

## Added

  - Now displays console output from your app if there is any (useful for debugging).

## [1.2.0] - 2021-03-04

Bail-out monkey.

## Added

  - Handles bail-out events.

## Updated

  - tap-out: version 3.1.0 → 3.2.0

## [1.1.1] - 2021-03-03

Fix typos.

## [1.1.0] - 2021-03-03

Quiet monkey.

### Added

  - `--quiet` option: when passed, only an initial notice is shown that tests are running and no further updates are given unless there are failures or until the final summary and/or coverage report are shown. This might help folks using assistive devices like screen readers who might otherwise get overwhelmed by notifications of running/passing tests as well as anyone else who wants a generally calmer monkey.

## [1.0.0] - 2021-03-02

Initial release.
