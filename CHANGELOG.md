# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2023-09-13

### Added

- Configure the comparison of values to decide on dirtiness

## [2.0.1] - 2023-03-02

### Fixed

- Value update is propagated now immediately to prevent lose of cursor positions in input fields
- Stateful effect hooks adjusted to fix the `React.StrictMode`
- Do not minify library code for better debuggability

## [2.0.0] - 2022-07-10

### Changed

- [Migration Guide 2.0.0](https://github.com/fdc-viktor-luft/morfi/blob/master/MIGRATIONGUIDE.md#200)
