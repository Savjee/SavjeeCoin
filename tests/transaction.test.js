const assert = require('assert');
const crypto = require('crypto');
const EC = require('elliptic').ec;

const { Transaction } = require('../src/blockchain');

describe('Transaction class', function() {
  let txObject = null;
  const signingKey = (new EC('secp256k1')).keyFromPrivate('some-private-key');
  const fromAddress = signingKey.getPublic('hex');
  const toAddress = signingKey.getPublic('hex');
  const amount = 100;

  beforeEach(function() {
    txObject = new Transaction(fromAddress, toAddress, amount);
    txObject.sign(signingKey);
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
      const expectedHash = crypto.createHash('sha256').update(txObject.fromAddress + txObject.toAddress + txObject.amount + txObject.timestamp).digest('hex');

      assert.strict.equal(
        txObject.calculateHash(),
        expectedHash
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
      const hashTx = txObject.calculateHash();
      const sig = signingKey.sign(hashTx, 'base64');
      const expectedSignature = sig.toDER('hex');

      assert.strict.equal(
        txObject.signature,
        expectedSignature
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
      // Tamper the amount making the signature invalid
      txObject.amount = 50;

      assert(!txObject.isValid());
    });

    it('should return true for correctly signed tx', function() {
      assert(txObject.isValid());
    });
  });
});
