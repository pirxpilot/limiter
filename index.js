
module.exports = limiter;

/*global setTimeout, clearTimeout */

function limiter(interval, penaltyInterval) {

  var queue = [],
    lastTrigger = 0,
    penaltyCounter = 0,
    skipCounter = 0,
    timer;

  function now() {
    return Date.now();
  }

  function since() {
    return now() - lastTrigger;
  }

  function currentInterval() {
    return penaltyCounter > 0 ? penaltyInterval : interval;
  }

  function runNow(fn) {
    penaltyCounter = 0;
    fn();
    // wait to the next interval unless told to skip
    // to the next operation immediately
    if (skipCounter > 0) {
      skipCounter = 0;
    }
    else {
      lastTrigger = now();
    }
  }

  function deque() {
    timer = undefined;
    if (since() >= currentInterval()) {
      runNow(queue.shift());
    }
    schedule();
  }

  function schedule() {
    var delay;
    if (!timer && queue.length) {
      delay = currentInterval() - since();
      if (delay < 0) {
        return deque();
      }
      timer = setTimeout(deque, delay);
    }
  }

  function trigger(fn) {
    if (since() >= currentInterval() && !queue.length) {
      runNow(fn);
    } else {
      queue.push(fn);
      schedule();
    }
  }

  function penalty() {
    penaltyCounter += 1;
  }

  function skip() {
    skipCounter += 1;
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer);
    }
    queue = [];
  }

  penaltyInterval = penaltyInterval || 5 * interval;
  return {
    trigger: trigger,
    penalty: penalty,
    skip: skip,
    cancel: cancel
  };
}
