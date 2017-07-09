var assert = require('assert');
var util = ProjRequire('./lib/util.js');
describe('util.js', function() {
  this.timeout(15000);
  
  describe('in_array', function() {
    it('test an item inside an array (all string)', function() {
		assert.equal(util.in_array('a', ['a','b','c']), true);
    });
	it('test an item not inside an array (all string)', function() {
		assert.equal(util.in_array('d', ['a','b','c']), false);
    });
	it('test an item inside an array (all int)', function() {
		assert.equal(util.in_array(1, [1,2,3]), true);
    });
	it('test an item not inside an array (all int)', function() {
		assert.equal(util.in_array(4, [1,2,3]), false);
    });
	it('test an item inside an array 1 (mixed)', function() {
		assert.equal(util.in_array(2, ['a',2,'c']), true);
    });
	it('test an item inside an array 2 (mixed)', function() {
		assert.equal(util.in_array('c', ['a',2,'c']), true);
    });
	it('test an item not inside an array (mixed)', function() {
		assert.equal(util.in_array(4, ['a',2,'c']), false);
    });
  });
  
  describe('getStringBetween', function() {
	function buildTest(str, start, end, expected) {
		it('test a string [' + str + '] between [' + start + '] and [' + end + '] and result should be [' + expected + ']', function() {
			assert.equal(util.getStringBetween(str, start, end), expected);
		});
	}
    buildTest('One Nation One People', 'One', 'One People', ' Nation ');
	buildTest('One Nation One People', 'One', 'One', ' Nation ');
	buildTest('we One Nation One People', 'w', 'One', 'e ');
	buildTest('we One Nation One People', 'w', 'One ', 'e ');
	buildTest('we One Nation One People', 'w', 'One N', 'e ');
	buildTest('we One Nation One People', 'w', 'One P', 'e One Nation ');
	buildTest('we One Nation One People', 'w', 'z', null);
  });
  describe('clone', function() {
	it('mixed clone test', function() {
		var a = {one:1,two:2,three:3,four:function() {},five:new String('555'),six:[1,2,3],seven:new Date(),eight:{a:{c:'1'},b:[{e:3},{}]}};
		var b = util.clone(a);
		assert.equal(b.one, 1);
		assert.equal(b.two, 2);
		assert.equal(b.three, 3);
		assert.equal(typeof b.four,'function');
		assert.equal(b.five,'555');
		assert.equal(typeof b.six, 'object');
		assert.equal(b.six.length > 0, true);
		assert.equal(util.clone(null), null);
		assert.equal(typeof b.seven, 'object');
		assert.equal(b.seven.getTime() > 0, true);
		assert.equal(b.eight.a.c, '1');
		assert.equal(b.eight.b[0].e, 3);
    });
  });
});