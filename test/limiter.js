const test = require('node:test');
const limiter = require('../index.js');

test('limiter functions', async t => {
  await t.test('should call fn at most once per interval', (t, done) => {
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
      t.assert.equal(results.length, 4);
      results
        .map(function (item, i) {
          const prev = i === 0 ? results[0] : results[i - 1];
          return item - prev;
        })
        .forEach(function (item, i) {
          if (i > 0) {
            t.assert.ok(item >= interval);
          }
        });
      done();
    });
  });

  await t.test('should delay calls on penalty', (t, done) => {
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
      t.assert.equal(results.length, 4);
      results
        .map(function (item, i) {
          const prev = i === 0 ? results[0] : results[i - 1];
          return item - prev;
        })
        .forEach(function (item, i) {
          if (i === 0) {
            return;
          }
          if (i === 2) {
            t.assert.ok(item >= penaltyInterval);
          } else {
            t.assert.ok(item >= interval);
            t.assert.ok(item < penaltyInterval);
          }
        });
      done();
    });
  });

  await t.test('delay works even when queue is empty', (t, done) => {
    const interval = 50;
    const l = limiter(interval);
    const time = Date.now();

    l.trigger(function () {});
    l.trigger(function () {
      const delay = Date.now() - time;
      t.assert.ok(delay >= interval);
      done();
    });
  });

  await t.test('penalty works even when queue is empty', (t, done) => {
    const interval = 50;
    const l = limiter(interval);
    const time = Date.now();

    l.trigger(function () {
      l.penalty();
    });
    l.trigger(function () {
      const delay = Date.now() - time;
      t.assert.ok(delay >= 5 * interval);
      done();
    });
  });

  await t.test('should skip interval on true', (t, done) => {
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
      t.assert.equal(results.length, 4);
      results
        .map(function (item, i) {
          const prev = i === 0 ? results[0] : results[i - 1];
          return item - prev;
        })
        .forEach(function (item, i) {
          if (i > 1) {
            t.assert.ok(item < interval);
          }
        });
      done();
    });
  });
});

test('limiter promises', async t => {
  await t.test('should call fn at most once per interval', async t => {
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

    t.assert.equal(results.length, 4);
    results
      .map(function (item, i) {
        const prev = i === 0 ? results[0] : results[i - 1];
        return item - prev;
      })
      .forEach(function (item, i) {
        if (i > 0) {
          t.assert.ok(item >= interval);
        }
      });
  });

  await t.test('should delay calls on penalty', async t => {
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

    t.assert.equal(results.length, 4);
    results
      .map(function (item, i) {
        const prev = i === 0 ? results[0] : results[i - 1];
        return item - prev;
      })
      .forEach(function (item, i) {
        if (i === 0) {
          return;
        }
        if (i === 2) {
          t.assert.ok(item >= penaltyInterval);
        } else {
          t.assert.ok(item >= interval);
          t.assert.ok(item < penaltyInterval);
        }
      });
  });

  await t.test('delay works even when queue is empty', async t => {
    const interval = 50;
    const l = limiter(interval);
    const time = Date.now();

    l.trigger();
    await l.trigger();

    const delay = Date.now() - time;
    t.assert.ok(delay >= interval);
  });

  await t.test('penalty works even when queue is empty', async t => {
    const interval = 50;
    const l = limiter(interval);
    const time = Date.now();

    l.trigger(() => l.penalty());
    await l.trigger();
    const delay = Date.now() - time;
    t.assert.ok(delay >= 5 * interval);
  });

  await t.test('should skip interval on true', async t => {
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

    t.assert.equal(results.length, 4);
    results
      .map(function (item, i) {
        const prev = i === 0 ? results[0] : results[i - 1];
        return item - prev;
      })
      .forEach(function (item, i) {
        if (i > 1) {
          t.assert.ok(item < interval);
        }
      });
  });
});
