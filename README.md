[![npm version][npm-image]][npm-url]
[![downloads][downloads-image]][npm-url]
[![build status][build-image]][build-url]
[![coverage status][coverage-image]][coverage-url]
[![Language grade: JavaScript][lgtm-image]][lgtm-url]
[![Node.JS version][node-version]][node-url]


# next-chunk

This package provides an easy mechanism to read the first chunk in a readable stream. It returns a promise which will be resolved with the chunk (either a `Buffer` or a `string`), or `null` if the stream was ended. It rejects the promise if an error occured on the stream.


## Versions

 * Since v2 this is a [pure ESM][pure-esm] package, and requires Node.js >=12.20. It cannot be used from CommonJS.


# API

## Importing

If importing using TypeScript or ES6 modules:

```ts
import nextChunk from 'next-chunk'
```

## Usage

```ts
const readable = getSomeReadableStream( );

const firstChunk = await nextChunk( readable );
const secondChunk = await nextChunk( readable );
// ... eventually the stream may end, we get
const endedChunk = await nextChunk( readable );
const againChunk = await nextChunk( readable );

// These chunks contain buffers or strings
expect( firstChunk ).to.not.be.null;
expect( secondChunk ).to.not.be.null;
// These are all null
expect( endedChunk ).to.be.null;
expect( againChunk ).to.be.null;
```

[downloads-image]: https://img.shields.io/npm/dm/next-chunk.svg
[build-image]: https://img.shields.io/github/workflow/status/grantila/next-chunk/Master.svg
[build-url]: https://github.com/grantila/next-chunk/actions?query=workflow%3AMaster
[coverage-image]: https://coveralls.io/repos/github/grantila/next-chunk/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/grantila/next-chunk?branch=master
[lgtm-image]: https://img.shields.io/lgtm/grade/javascript/g/grantila/next-chunk.svg?logo=lgtm&logoWidth=18
[lgtm-url]: https://lgtm.com/projects/g/grantila/next-chunk/context:javascript
[node-version]: https://img.shields.io/node/v/next-chunk
[node-url]: https://nodejs.org/en/
[pure-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c