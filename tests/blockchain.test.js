const assert = require('assert');
const { Blockchain, Transaction } = require('../src/blockchain');
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

    // It should be allowed to create a transaction from and to the same address
    // This tests make sure that it works and that the balance of the wallet
    // stays the same.
    // Discussion: https://github.com/Savjee/SavjeeCoin/pull/52
    it('should work with cyclic transactions', function() {
      const walletAddr = signingKey.getPublic('hex');
      const blockchain = createBlockchainWithTx();

      assert.strict.equal(blockchain.getBalanceOfAddress(walletAddr), 80);

      // Create new transaction to self
      const tx = new Transaction(walletAddr, walletAddr, 80);
      tx.timestamp = 1;
      tx.sign(signingKey);

      blockchain.addTransaction(tx);
      blockchain.minePendingTransactions('no_addr');
      assert.strict.equal(blockchain.getBalanceOfAddress(walletAddr), 80);
    });
  });

  describe('minePendingTransactions', function() {
    // It should not be possible for a user to create multiple pending
    // transactions for a total amount higher than his balance.
    // In this test we start with this situation:
    //    - Wallet "walletAddr" -> 80 coins (100 mining reward - 2 test tx)
    //    - Wallet "wallet2" -> 0 coins
    it('should not allow pending transactions to go below zero', function() {
      const blockchain = createBlockchainWithTx();
      const walletAddr = signingKey.getPublic('hex');

      // Verify that the wallets have the correct balance
      assert.strict.equal(blockchain.getBalanceOfAddress('wallet2'), 0);
      assert.strict.equal(blockchain.getBalanceOfAddress(walletAddr), 80);

      // Create a transaction for 80 coins (from walletAddr -> "wallet2")
      blockchain.addTransaction(createSignedTx(80));

      // Try tro create another transaction for which we don't have the balance.
      // Blockchain should refuse this!
      assert.throws(() => { blockchain.addTransaction(createSignedTx(80)); }, Error);

      // Mine transactions, send rewards to another address
      blockchain.minePendingTransactions(1);

      // Verify that the first transaction did go through.
      assert.strict.equal(blockchain.getBalanceOfAddress(walletAddr), 0);
      assert.strict.equal(blockchain.getBalanceOfAddress('wallet2'), 80);
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

    it('should fail when a previous block hash has been changed', function() {
      const blockchain = createBlockchainWithTx();
      blockchain.chain[1].transactions[0].amount = 897397;
      blockchain.chain[1].hash = blockchain.chain[1].calculateHash();
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
