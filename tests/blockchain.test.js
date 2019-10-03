const assert = require('assert');
const { Blockchain } = require('../src/blockchain');
const { createSignedTx, signingKey, createBlockchainWithTx, createBCWithMined } = require('./helpers');

let blockchain = null;

beforeEach(function() {
  blockchain = new Blockchain();
});

describe('Blockchain class', function() {
  describe('Constructor', function() {
    it('should properly initialize fields', function() {
      assert.strict.equal(blockchain.difficulty, 2);
      assert.strict.deepEqual(blockchain.pendingTransactions, []);
      assert.strict.equal(blockchain.miningReward, 100);
    });
  });

  describe('addTransaction', function() {
    it('should correctly add new tx', function() {
      const blockchain = createBCWithMined();
      const validTx = createSignedTx();
      blockchain.addTransaction(validTx);

      assert.strict.deepEqual(blockchain.pendingTransactions[0], validTx);
    });

    it('should fail for tx without from address', function() {
      const validTx = createSignedTx();
      validTx.fromAddress = null;

      assert.throws(() => { blockchain.addTransaction(validTx); }, Error);
    });

    it('should fail for tx without to address', function() {
      const validTx = createSignedTx();
      validTx.toAddress = null;

      assert.throws(() => { blockchain.addTransaction(validTx); }, Error);
    });

    it('should fail when tx is not valid', function() {
      const validTx = createSignedTx();
      validTx.amount = 1000;

      assert.throws(() => { blockchain.addTransaction(validTx); }, Error);
    });
        
    it('should fail when tx has negative or zero amount', function() {
      const tx1 = createSignedTx(0);
      assert.throws(() => { blockchain.addTransaction(tx1); }, Error);

      const tx2 = createSignedTx(-20);
      assert.throws(() => { blockchain.addTransaction(tx2); }, Error);
    });

    it('should fail when not having enough balance', function() {
      const tx1 = createSignedTx();
      assert.throws(() => { blockchain.addTransaction(tx1); }, Error);
    });
  });

  describe('wallet balance', function() {
    it('should give mining rewards', function() {
      const blockchain = createBCWithMined();
      const validTx = createSignedTx();
      blockchain.addTransaction(validTx);
      blockchain.addTransaction(validTx);

      blockchain.minePendingTransactions('b2');

      assert.strict.equal(blockchain.getBalanceOfAddress('b2'), 100);
    });

    it('should correctly reduce wallet balance', function() {
      const walletAddr = signingKey.getPublic('hex');
      const blockchain = createBlockchainWithTx();

      blockchain.minePendingTransactions(walletAddr);
      assert.strict.equal(blockchain.getBalanceOfAddress(walletAddr), 180);
    });
  });

  describe('helper functions', function() {
    it('should correctly set first block to genesis block', function() {
      assert.strict.deepEqual(blockchain.chain[0], blockchain.createGenesisBlock());
    });
  });

  describe('isChainValid', function() {
    it('should return true if no tampering', function() {
      const blockchain = createBlockchainWithTx();
      assert(blockchain.isChainValid());
    });

    it('should fail when genesis block has been tampered with', function() {
      blockchain.chain[0].timestamp = 39708;
      assert(!blockchain.isChainValid());
    });

    it('should fail when a tx is invalid', function() {
      const blockchain = createBlockchainWithTx();
      blockchain.chain[2].transactions[1].amount = 897397;
      assert(!blockchain.isChainValid());
    });

    it('should fail when a block has been changed', function() {
      const blockchain = createBlockchainWithTx();
      blockchain.chain[1].timestamp = 897397;
      assert(!blockchain.isChainValid());
    });
  });
  
  describe('getAllTransactionsForWallet', function() {
    it('should get all Transactions for a Wallet', function() {
      const blockchain = createBCWithMined();
      const validTx = createSignedTx();
      blockchain.addTransaction(validTx);
      blockchain.addTransaction(validTx);

      blockchain.minePendingTransactions('b2');
      blockchain.addTransaction(validTx);
      blockchain.addTransaction(validTx);
      blockchain.minePendingTransactions('b2');

      assert.strict.equal(blockchain.getAllTransactionsForWallet('b2').length, 2);
      assert.strict.equal(blockchain.getAllTransactionsForWallet(signingKey.getPublic('hex')).length, 5);
      for (const trans of blockchain.getAllTransactionsForWallet('b2')) {
        assert.strict.equal(trans.amount, 100);
        assert.strict.equal(trans.fromAddress, null);
        assert.strict.equal(trans.toAddress, 'b2');
      }
    });
  });
});
