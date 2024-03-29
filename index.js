module.exports = limiter;

function limiter(interval, penaltyInterval = 5 * interval) {
  let queue = [];
  let lastTrigger = 0;
  let penaltyCounter = 0;
  let skipCounter = 0;
  let timer;

  return {
    trigger,
    penalty,
    skip,
    cancel
  };

  function trigger(fn) {
    const p = promised(fn);
    if (since() >= currentInterval() && !queue.length) {
      runNow(p);
    } else {
      queue.push(p);
      schedule();
    }
    return p.promise;
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
    queue.forEach(p => p.reject());
    queue = [];
  }

  function since() {
    return Date.now() - lastTrigger;
  }

  function currentInterval() {
    return penaltyCounter > 0 ? penaltyInterval : interval;
  }

  function runNow(p) {
    penaltyCounter = 0;
    p.resolve();
    // wait to the next interval unless told to skip
    // to the next operation immediately
    if (skipCounter > 0) {
      skipCounter = 0;
    } else {
      lastTrigger = Date.now();
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
    if (!timer && queue.length) {
      const delay = currentInterval() - since();
      if (delay < 0) {
        return deque();
      }
      timer = setTimeout(deque, delay);
    }
  }
}

function promised(fn) {
  let _ = {};
  const promise = new Promise((resolve, reject) => _ = { resolve, reject });
  return {
    promise,
    resolve,
    reject
  };

  function resolve() {
    if (fn) { fn(); }
    _.resolve();
  }
  function reject() {
    _.reject();
  }
}
