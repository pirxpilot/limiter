[![Build Status](https://secure.travis-ci.org/code42day/limiter.png)](http://travis-ci.org/code42day/limiter)

# limiter

  Limits the rate of function calls to one per period. It delays but does not throttle the calls.
  Useful when your codes needs to behave well when calling rate limited API.

  If you need something more flexible use [rate limiter](https://npmjs.org/package/limiter)

## Installation

    $ component install code42day/limiter


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
l.trigger(doThat);
```

## API

### limiter(interval)

Create `limiter` with desired `interval` (in millis).

### trigger(fn)

Add `fn` to `limiter` queue. It will be called when `interval` elapsed since another function from
the queue was called.

### cancel()

Empty `limiter` queue. Remove all pending trigger request. No methods from the queue is called after
`cancel`.

## License

  MIT
