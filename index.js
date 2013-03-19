
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
    var fn = queue.shift();
    timer = undefined;
    lastTrigger = now();
    fn();
    if (queue.length) {
      schedule();
    }
  }

  function schedule() {
    var now = Date.now();
    timer = setTimeout(deque, interval - since());
  }

  function trigger(fn) {
    queue.push(fn);
    if (since() >= interval) {
      deque();
    }
    else {
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