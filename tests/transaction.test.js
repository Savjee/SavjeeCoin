const assert = require('assert');
const { Transaction } = require('../src/blockchain');
const { createSignedTx, signingKey } = require('./helpers');

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

      assert.strict.equal(txObject.fromAddress, 'a1');
      assert.strict.equal(txObject.toAddress, 'b1');
      assert.strict.equal(txObject.amount, 10);
    });
  });

  describe('Calculate hash', function() {
    it('should correct calculate the SHA256', function() {
      txObject = new Transaction('a1', 'b1', 10);
      txObject.timestamp = 1;

      assert.strict.equal(
        txObject.calculateHash(),

        // Output of SHA256(a1b1101)
        '21894bb7b0e56aab9eb48d4402d94628a9a179bc277542a5703f417900275153'
      );
    });

    it('should change when we tamper with the tx', function() {
      txObject = new Transaction('a1', 'b1', 10);

      const originalHash = txObject.calculateHash();
      txObject.amount = 100;

      assert.strict.notEqual(
        txObject.calculateHash(),
        originalHash
      );
    });
  });

  describe('isValid', function() {
    it('should throw error without signature', function() {
      assert.throws(() => { txObject.isValid(); }, Error);
    });

    it('should correctly sign transactions', function() {
      txObject = createSignedTx();

      assert.strict.equal(
        txObject.signature,
        '3044022023fb1d818a0888f7563e1a3ccdd68b28e23070d6c0c1c5' +
'004721ee1013f1d769022037da026cda35f95ef1ee5ced5b9f7d70' +
'e102fcf841e6240950c61e8f9b6ef9f8'
      );
    });

    it('should not sign transactions for other wallets', function() {
      txObject = new Transaction('not a correct wallet key', 'wallet2', 10);
      txObject.timestamp = 1;

      assert.throws(() => {
        txObject.signTransaction(signingKey);
      }, Error);
    });

    it('should detect badly signed transactions', function() {
      txObject = createSignedTx();

      // Tamper with it & it should be invalid!
      txObject.amount = 100;
      assert(!txObject.isValid());
    });

    it('should return true with correctly signed tx', function() {
      txObject = createSignedTx();
      assert(txObject.isValid());
    });

    it('should fail when signature is empty string', function() {
      txObject.signature = '';
      assert.throws(() => { txObject.isValid(); }, Error);
    });

    it('should return true for mining rewards', function() {
      txObject.fromAddress = null;
      assert(txObject.isValid());
    });
  });
});
