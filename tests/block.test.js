const assert = require('assert');
const { Block, Transaction } = require('../src/blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

let blockObj = null;
let signingKey = ec.keyFromPrivate('3d6f54430830d388052865b95c10b4aeb1bbe33c01334cf2cfa8b520062a0ce3');


beforeEach(function() {
    blockObj = new Block(1000, [createCorrectlySignedTransaction()], 'a1');
});

function createCorrectlySignedTransaction(){
	txObject = new Transaction(signingKey.getPublic('hex'), 'wallet2', 10);
    txObject.timestamp = 1;
    txObject.signTransaction(signingKey);

    return txObject;
}

describe('Block class', function() {
    describe('Constructor', function() {
        it('should correctly save parameters', function() {
            assert.equal(blockObj.previousHash, 'a1');
            assert.equal(blockObj.timestamp, 1000);
            assert.deepEqual(blockObj.transactions, [createCorrectlySignedTransaction()]);
            assert.equal(blockObj.nonce, 0);
        });
    });

    describe('Calculate hash', function() {
        it('should correct calculate the SHA256', function() {
            blockObj.timestamp = 1;
            blockObj.mineBlock(1);

            assert.equal(
                blockObj.hash,
                '07d2992ddfcb8d538075fea2a6a33e7fb546c18038ae1a8c0214067ed66dc393'
            );
        });

        it('should change when we tamper with the tx', function(){
            const origHash = blockObj.calculateHash();
            blockObj.timestamp = 100;

            assert.notEqual(
                blockObj.calculateHash(),
                origHash
            );
        });
    });

    describe('has valid transactions', function(){
        it('should return true with all valid tx', function(){
            blockObj.transactions = [
                createCorrectlySignedTransaction(),
                createCorrectlySignedTransaction(),
                createCorrectlySignedTransaction(),
            ];

            assert(blockObj.hasValidTransactions());
        });

        it('should return false when a single tx is bad', function(){
            const badTx = createCorrectlySignedTransaction();
            badTx.amount = 1337;

            blockObj.transactions = [
                createCorrectlySignedTransaction(),
                badTx
            ];

            assert(!blockObj.hasValidTransactions());
        });
    });

});
