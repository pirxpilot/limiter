var limiter = require('../index.js');
var assert = require('assert');


describe('limiter', function(){
  it('should call fn at most once per interval', function(done){
    var interval = 35,
      l = limiter(interval),
      results = [];

    function push() {
      results.push(+(new Date));
    }

    l.trigger(push);
    l.trigger(push);
    l.trigger(push);
    l.trigger(push);
    l.trigger(function() {
      assert.equal(results.length, 4);
      results
        .map(function(item, i) {
          var prev = (i === 0) ? results[0] : results[i - 1];
          return item - prev;
        })
        .forEach(function(item, i) {
          if (i > 0) {
            assert.ok(item >= interval);
          }
        });
      done();
    });
  });

  it('should delay calls on penalty', function(done) {
    var interval = 35,
      penaltyInterval = 150,
      l = limiter(interval, penaltyInterval),
      results = [];

    function push() {
      results.push(+(new Date));
      if (results.length === 2) {
        l.penalty();
      }
    }

    l.trigger(push);
    l.trigger(push);
    l.trigger(push);
    l.trigger(push);
    l.trigger(function() {
      assert.equal(results.length, 4);
      results
        .map(function(item, i) {
          var prev = (i === 0) ? results[0] : results[i - 1];
          return item - prev;
        })
        .forEach(function(item, i) {
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

  it('delay works even when queue is empty', function(done) {
    var interval = 50,
      l = limiter(interval),
      time = Date.now();

    l.trigger(function() {
    });
    l.trigger(function() {
      var delay = Date.now() - time;
      assert.ok(delay >= interval);
      done();
    });
  });

  it('penalty works even when queue is empty', function(done) {
    var interval = 50,
      l = limiter(interval),
      time = Date.now();

    l.trigger(function() {
      l.penalty();
    });
    l.trigger(function() {
      var delay = Date.now() - time;
      assert.ok(delay >= 5 * interval);
      done();
    });
  });
});
