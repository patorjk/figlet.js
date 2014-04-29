

'use strict';

var figlet = require('../lib/node-figlet'),
    grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.figlet = {
    setUp: function(done) {
        // setup here if necessary
        done();
    },
    standard: function(test) {
        test.expect(1);
        
        figlet('FIGlet\nFONTS', {
            font: 'Standard',
            verticalLayout: 'fitted'
        }, function(err, actual) {
            var expected = grunt.file.read('test/expected/standard');
            test.equal(actual, expected, 'Standard font with a vertical layout of "fitted".');

            test.done();
        });
    },
    graffiti: function(test) {
        test.expect(1);

        figlet.text('ABC.123', {
            font: 'Graffiti',
            horizontalLayout: 'fitted'
        }, function(err, actual) {
            var expected = grunt.file.read('test/expected/graffiti');
            test.equal(actual, expected, 'Graffiti font with a horizontal layout of "fitted".');

            test.done();
        });
    },
    dancingFont: function(test) {
        test.expect(1);

        figlet.text('pizzapie', {
            font: 'Dancing Font',
            horizontalLayout: 'full'
        }, function(err, actual) {

            var expected = grunt.file.read('test/expected/dancingFont');
            test.equal(actual, expected, 'Dancing Font with a horizontal layout of "full".');

            test.done();
        });
    },
};
