var limiter = require('../index.js');
var assert = require('assert');


describe('limiter', function(){
  it('should call fn at most once per interval', function(done){
    var l = limiter(200),
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
        .map(function(item) {
          return item - results[0];
        })
        .forEach(function(item, i) {
          if (i > 0) {
            assert.ok(item >= 200);
          }
        });
      done();
    });
  });
});
