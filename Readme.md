[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

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

// you can also wait for the trigger using Promises

await l.trigger(); // note that `fn` is optional
// trigger has been resolved
```

## API

### limiter(interval, [penaltyInterval])

Create `limiter` with desired `interval` (in millis). Optional `penaltyInterval` is used instead of
`interval` if `limiter.penalty()` has been called at least once since last limited function has been
triggered.

### trigger(fn)

Add `fn` to `limiter` queue. It will be called when `interval` elapsed since another function from
the queue was called. Returns a promise, which is resolved when `fn` is called.

### penalty()

Make limiter use `penaltyInterval` before triggering next function.

### skip()

Make limiter trigger next function immediately.

### cancel()

Empty `limiter` queue. Remove all pending trigger request. No methods from the queue is called after
`cancel`.

## License

  MIT

[npm-image]: https://img.shields.io/npm/v/limiter-component
[npm-url]: https://npmjs.org/package/limiter-component

[build-url]: https://github.com/pirxpilot/limiter/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/workflow/status/pirxpilot/limiter/check

[deps-image]: https://img.shields.io/librariesio/release/npm/limiter-component
[deps-url]: https://libraries.io/npm/limiter-component
