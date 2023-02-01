const assert = require('assert');

const { Transaction } = require('../src/blockchain');
const { createSignedTx, signingKey } = require('./helpers');

describe('Transaction class', function() {
  let txObject = null;
  const fromAddress = 'fromAddress';
  const toAddress = 'toAddress';
  const amount = 100;

  beforeEach(function() {
    txObject = new Transaction(fromAddress, toAddress, amount);
  });

  describe('constructor', function() {
    it('should automatically set the current date', function() {
      const actual = txObject.timestamp;
      const minTime = Date.now() - 1000;
      const maxTime = Date.now() + 1000;

      assert(actual > minTime && actual < maxTime, 'Tx does not have a good timestamp');
    });

    it('should correctly save from, to and amount', function() {
      assert.strict.equal(txObject.fromAddress, fromAddress);
      assert.strict.equal(txObject.toAddress, toAddress);
      assert.strict.equal(txObject.amount, amount);
    });
  });

  describe('calculateHash', function() {
    it('should correctly calculate the SHA256 hash', function() {
      txObject.timestamp = 1;

      assert.strict.equal(
        txObject.calculateHash(),
        '4be9c20f87f7baac191aa246a33b5d44af1f96f23598ac06e5f71ee222f40abf'
      );
    });

    it('should output a different hash if data is tampered in the transaction', function() {
      // Tamper the amount making the hash different
      txObject.amount = 50;

      assert.strict.notEqual(
        txObject.calculateHash(),
        txObject.hash
      );
    });
  });

  describe('sign', function() {
    it('should correctly sign transactions', function() {
      txObject = createSignedTx();

      assert.strict.equal(
        txObject.signature,
        '3044022023fb1d818a0888f7563e1a3ccdd68b28e23070d6c0c1c5004721ee1013f1d7' +
        '69022037da026cda35f95ef1ee5ced5b9f7d70e102fcf841e6240950c61e8f9b6ef9f8'
      );
    });

    it('should not sign transactions with fromAddresses that does not belogs to the private key', function() {
      txObject.fromAddress = 'some-other-address';

      assert.throws(() => {
        txObject.sign(signingKey);
      }, Error);
    });
  });

  describe('isValid', function() {
    it('should return true for mining reward transactions', function() {
      txObject.fromAddress = null;
      assert(txObject.isValid());
    });

    it('should throw error if signature is invalid', function() {
      delete txObject.signature;
      assert.throws(() => { txObject.isValid(); }, Error);

      txObject.signature = '';
      assert.throws(() => { txObject.isValid(); }, Error);
    });

    it('should return false for badly signed transactions', function() {
      txObject = createSignedTx(10);

      // Tamper the amount making the signature invalid
      txObject.amount = 50;

      assert(!txObject.isValid());
    });

    it('should return true for correctly signed tx', function() {
      txObject = createSignedTx(10);
      assert(txObject.isValid());
    });
  });
});
