# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- MCCP support

## [1.0.4] - 2017-11-25
### Added
- Example source code to ensure examples function properly
### Changed
- Examples in README.md to make them functional

## [1.0.3] - 2017-11-25
### Changed
- Minor clean up of package.json

## [1.0.2] - 2017-11-25
### Added
- CHANGELOG.md added to npm published files in package.json

## [1.0.1] - 2017-11-25
### Changed
- Minor clean up of TelnetOutput

## 1.0.0 - 2017-11-25
### Added
- TelnetSocket to decorate a net.Socket
- Options object to specify subnegotiation buffer size and error policy
- Emit error events on subnegotiation errors
- Test coverage reporting with istanbul
- LICENSE and README.md files to npm published archive
- CHANGELOG.md to track project changes

### Changed
- Default behavior for subnegotiation errors; bytes are kept not discarded
- Location of test sources

[Unreleased]: https://github.com/blinkdog/telnet-stream/compare/v1.0.4...HEAD
[1.0.4]: https://github.com/blinkdog/telnet-stream/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/blinkdog/telnet-stream/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/blinkdog/telnet-stream/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/blinkdog/telnet-stream/compare/v1.0.0...v1.0.1
