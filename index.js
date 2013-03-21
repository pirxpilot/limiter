
module.exports = limiter;

/*global setTimeout, clearTimeout */

function limiter(interval) {

  var queue = [], lastTrigger = 0, timer;

  function now() {
    return + (new Date);
  }

  function since() {
    return now() - lastTrigger;
  }

  function deque() {
    timer = undefined;
    var fn = queue.shift();
    fn();
    lastTrigger = now();
    schedule();
  }

  function schedule() {
    if (!timer && queue.length) {
      timer = setTimeout(deque, interval - since());
    }
  }

  function trigger(fn) {
    if (since() >= interval && !queue.length) {
      fn();
      lastTrigger = now();
    } else {
      queue.push(fn);
      schedule();
    }
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer);
    }
    queue = [];
  }

  return {
    trigger: trigger,
    cancel: cancel
  };
}
