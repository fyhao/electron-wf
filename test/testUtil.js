var assert = require('assert');
var util = ProjRequire('./lib/util.js');
describe('util.js', function() {
  this.timeout(15000);
  
  describe('in_array', function() {
    it('test an item inside an array (all string)', function() {
		assert.equal(true, util.in_array('a', ['a','b','c']));
    });
	it('test an item not inside an array (all string)', function() {
		assert.equal(false, util.in_array('d', ['a','b','c']));
    });
	it('test an item inside an array (all int)', function() {
		assert.equal(true, util.in_array(1, [1,2,3]));
    });
	it('test an item not inside an array (all int)', function() {
		assert.equal(false, util.in_array(4, [1,2,3]));
    });
	it('test an item inside an array 1 (mixed)', function() {
		assert.equal(true, util.in_array(2, ['a',2,'c']));
    });
	it('test an item inside an array 2 (mixed)', function() {
		assert.equal(true, util.in_array('c', ['a',2,'c']));
    });
	it('test an item not inside an array (mixed)', function() {
		assert.equal(false, util.in_array(4, ['a',2,'c']));
    });
  });
  
  describe('getStringBetween', function() {
	function buildTest(str, start, end, expected) {
		it('test a string [' + str + '] between [' + start + '] and [' + end + '] and result should be [' + expected + ']', function() {
			assert.equal(expected, util.getStringBetween(str, start, end));
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
		assert.equal(1, b.one);
		assert.equal(2, b.two);
		assert.equal(3, b.three);
		assert.equal('function', typeof b.four);
		assert.equal('555', b.five);
		assert.equal('object', typeof b.six);
		assert.equal(true, b.six.length > 0);
		assert.equal(null, util.clone(null));
		assert.equal('object', typeof b.seven);
		assert.equal(true, b.seven.getTime() > 0);
		assert.equal('1', b.eight.a.c);
		assert.equal(3, b.eight.b[0].e);
    });
  });
});