
module.exports = limiter;

/*global setTimeout, clearTimeout */

function limiter(interval, penaltyInterval) {

  var queue = [],
    lastTrigger = 0,
    penaltyCounter = 0,
    timer;

  function now() {
    return + (new Date);
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
    lastTrigger = now();
  }

  function deque() {
    timer = undefined;
    if (since() >= currentInterval()) {
      runNow(queue.shift());
    }
    schedule();
  }

  function schedule() {
    if (!timer && queue.length) {
      timer = setTimeout(deque, currentInterval() - since());
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
    cancel: cancel
  };
}
