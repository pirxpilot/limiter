[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][gemnasium-image]][gemnasium-url]

# limiter

  Limits the rate of function calls to one per period. It delays but does not throttle the calls.
  Useful when your codes needs to behave well when calling rate limited API.

  If you need something more flexible use [rate limiter](https://npmjs.org/package/limiter)

## Installation

    $ npm install --save limiter-component

## Usage

Create `limiter` with desired `interval` setting. Call `trigger` passing a function that you want to
limit.

```javascript
var limiter = require('limiter'),
	l = limiter(500); // interval in millis

function doThis() {
  // this is called at most twice per second
}

function doThat() {
  // you can rate limit different functions
}


l.trigger(doThis);
l.trigger(doThat);
l.trigger(doThis);
l.trigger(function() {
	l.penalty(); // wait a bit longer the next time
});
l.trigger(doThat);
l.trigger(function() {
	l.skip(); // don't wait at all the next time
});
l.trigger(doThis);
```

## API

### limiter(interval, [penaltyInterval])

Create `limiter` with desired `interval` (in millis). Optional `penaltyInterval` is used instead of
`interval` if `limiter.penalty()` has been called at least once since last limited function has been
triggered.

### trigger(fn)

Add `fn` to `limiter` queue. It will be called when `interval` elapsed since another function from
the queue was called.

### penalty()

Make limiter use `penaltyInterval` before triggering next function.

### skip()

Make limiter trigger next function immediately.

### cancel()

Empty `limiter` queue. Remove all pending trigger request. No methods from the queue is called after
`cancel`.

## License

  MIT

[npm-image]: https://img.shields.io/npm/v/limiter-component.svg
[npm-url]: https://npmjs.org/package/limiter-component

[travis-url]: https://travis-ci.org/code42day/limiter
[travis-image]: https://img.shields.io/travis/code42day/limiter.svg

[gemnasium-image]: https://img.shields.io/gemnasium/code42day/limiter.svg
[gemnasium-url]: https://gemnasium.com/code42day/limiter
