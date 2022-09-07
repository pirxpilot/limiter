const limiter = require('../index.js');
const assert = require('assert');

describe('limiter functions', function () {
  it('should call fn at most once per interval', function (done) {
    const interval = 35;
    const l = limiter(interval);
    const results = [];

    function push() {
      results.push(Date.now());
    }

    l.trigger(push);
    l.trigger(push);
    l.trigger(push);
    l.trigger(push);
    l.trigger(function () {
      assert.equal(results.length, 4);
      results
        .map(function (item, i) {
          const prev = (i === 0) ? results[0] : results[i - 1];
          return item - prev;
        })
        .forEach(function (item, i) {
          if (i > 0) {
            assert.ok(item >= interval);
          }
        });
      done();
    });
  });

  it('should delay calls on penalty', function (done) {
    const interval = 35;
    const penaltyInterval = 150;
    const l = limiter(interval, penaltyInterval);
    const results = [];

    function push() {
      results.push(Date.now());
      if (results.length === 2) {
        l.penalty();
      }
    }

    l.trigger(push);
    l.trigger(push);
    l.trigger(push);
    l.trigger(push);
    l.trigger(function () {
      assert.equal(results.length, 4);
      results
        .map(function (item, i) {
          const prev = (i === 0) ? results[0] : results[i - 1];
          return item - prev;
        })
        .forEach(function (item, i) {
          if (i === 0) {
            return;
          }
          if (i === 2) {
            assert.ok(item >= penaltyInterval);
          } else {
            assert.ok(item >= interval);
            assert.ok(item < penaltyInterval);
          }
        });
      done();
    });
  });

  it('delay works even when queue is empty', function (done) {
    const interval = 50;
    const l = limiter(interval);
    const time = Date.now();

    l.trigger(function () { });
    l.trigger(function () {
      const delay = Date.now() - time;
      assert.ok(delay >= interval);
      done();
    });
  });

  it('penalty works even when queue is empty', function (done) {
    const interval = 50;
    const l = limiter(interval);
    const time = Date.now();

    l.trigger(function () {
      l.penalty();
    });
    l.trigger(function () {
      const delay = Date.now() - time;
      assert.ok(delay >= 5 * interval);
      done();
    });
  });

  it('should skip interval on true', function (done) {
    const interval = 35;
    const l = limiter(interval);
    const results = [];

    l.trigger(function () {
      results.push(Date.now());
    });

    function push() {
      results.push(Date.now());
      l.skip();
    }

    l.trigger(push);
    l.trigger(push);
    l.trigger(push);
    l.trigger(function () {
      assert.equal(results.length, 4);
      results
        .map(function (item, i) {
          const prev = (i === 0) ? results[0] : results[i - 1];
          return item - prev;
        })
        .forEach(function (item, i) {
          if (i > 1) {
            assert.ok(item < interval);
          }
        });
      done();
    });
  });
});

describe('limiter promises', function () {
  it('should call fn at most once per interval', async function () {
    const interval = 35;
    const l = limiter(interval);
    const results = [];

    function push() {
      results.push(Date.now());
    }

    l.trigger(push);
    l.trigger(push);
    l.trigger(push);
    await l.trigger(push);

    assert.equal(results.length, 4);
    results
      .map(function (item, i) {
        const prev = (i === 0) ? results[0] : results[i - 1];
        return item - prev;
      })
      .forEach(function (item, i) {
        if (i > 0) {
          assert.ok(item >= interval);
        }
      });
  });

  it('should delay calls on penalty', async function () {
    const interval = 35;
    const penaltyInterval = 150;
    const l = limiter(interval, penaltyInterval);
    const results = [];

    function push() {
      results.push(Date.now());
      if (results.length === 2) {
        l.penalty();
      }
    }

    l.trigger(push);
    l.trigger(push);
    l.trigger(push);
    await l.trigger(push);

    assert.equal(results.length, 4);
    results
      .map(function (item, i) {
        const prev = (i === 0) ? results[0] : results[i - 1];
        return item - prev;
      })
      .forEach(function (item, i) {
        if (i === 0) {
          return;
        }
        if (i === 2) {
          assert.ok(item >= penaltyInterval);
        } else {
          assert.ok(item >= interval);
          assert.ok(item < penaltyInterval);
        }
      });
  });

  it('delay works even when queue is empty', async function () {
    const interval = 50;
    const l = limiter(interval);
    const time = Date.now();

    l.trigger();
    await l.trigger();

    const delay = Date.now() - time;
    assert.ok(delay >= interval);
  });

  it('penalty works even when queue is empty', async function () {
    const interval = 50;
    const l = limiter(interval);
    const time = Date.now();

    l.trigger(() => l.penalty());
    await l.trigger();
    const delay = Date.now() - time;
    assert.ok(delay >= 5 * interval);
  });

  it('should skip interval on true', async function () {
    const interval = 35;
    const l = limiter(interval);
    const results = [];

    l.trigger(() => results.push(Date.now()));
    l.trigger(push);
    l.trigger(push);
    await l.trigger(push);

    function push() {
      results.push(Date.now());
      l.skip();
    }

    assert.equal(results.length, 4);
    results
      .map(function (item, i) {
        const prev = (i === 0) ? results[0] : results[i - 1];
        return item - prev;
      })
      .forEach(function (item, i) {
        if (i > 1) {
          assert.ok(item < interval);
        }
      });
  });
});
