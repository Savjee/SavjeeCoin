const assert = require('assert');
const { Transaction } = require('../src/blockchain');

let txObject = null;


beforeEach(function() {
    txObject = new Transaction('fromAddress', 'toAddress', 9999);
});

describe('Transaction class', function() {
    describe('Constructor', function() {
        it('should automatically set the current date', function() {
            const actual = txObject.timestamp;
            const minTime = Date.now() - 1000;
            const maxTime = Date.now() + 1000;

            assert(actual > minTime && actual < maxTime, 'Tx does not have a good timestamp');
        });


        it('should correctly save from, to and amount', function() {
            txObject = new Transaction('a1', 'b1', 10);

            assert.equal(txObject.fromAddress, 'a1');
            assert.equal(txObject.toAddress, 'b1');
            assert.equal(txObject.amount, 10);
        });
    });

    describe('Calculate hash', function() {
        it('should correct calculate the SHA256', function() {
            txObject = new Transaction('a1', 'b1', 10);
            txObject.timestamp = 1;

            assert.equal(
                txObject.calculateHash(),

                // Output of SHA256(a1b1101)
                '21894bb7b0e56aab9eb48d4402d94628a9a179bc277542a5703f417900275153'
            );
        });
    });

    describe('isValid', function() {
        it('should throw error without signature', function() {
            assert.throws(txObject.isValid, Error);
        });
    });

});