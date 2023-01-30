const assert = require('assert');
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
    txObject.timestamp = 1;
    txObject.sign(signingKey);
  });

  describe('constructor', function() {
    it('should automatically set the current date', function() {
      txObject = new Transaction(fromAddress, toAddress, amount);
      
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
      assert.strict.equal(
        txObject.calculateHash(),
        '8e8e081788cba59d0e11fc881dab1f7fbe7eb3dd4f7db9d6382c892588cc912a'
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
      assert.strict.equal(
        txObject.signature,
        '3046022100b2e5ee31c4ebea01125c73c8ef031b35e23f58f363a2ba732860f512ad99b1' +
        '0b022100b89da6fff470eac3d085276dd7ce079e6d0b049181226eaf45ab0b43ecc6a0fd'
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
