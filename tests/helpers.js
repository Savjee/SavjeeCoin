const { Transaction, Blockchain } = require('../src/blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const signingKey = ec.keyFromPrivate('3d6f54430830d388052865b95c10b4aeb1bbe33c01334cf2cfa8b520062a0ce3');

function createSignedTx(amount = 10) {
  const txObject = new Transaction(signingKey.getPublic('hex'), 'wallet2', amount);
  txObject.timestamp = 1;
  txObject.sign(signingKey);

  return txObject;
}

function createBCWithMined() {
  const blockchain = new Blockchain();
  blockchain.minePendingTransactions(signingKey.getPublic('hex'));

  return blockchain;
}

function createBlockchainWithTx() {
  const blockchain = new Blockchain();
  blockchain.minePendingTransactions(signingKey.getPublic('hex'));

  const validTx = new Transaction(signingKey.getPublic('hex'), 'b2', 10);
  validTx.sign(signingKey);

  blockchain.addTransaction(validTx);
  blockchain.addTransaction(validTx);
  blockchain.minePendingTransactions(1);

  return blockchain;
}

module.exports.signingKey = signingKey;
module.exports.createSignedTx = createSignedTx;
module.exports.createBlockchainWithTx = createBlockchainWithTx;
module.exports.createBCWithMined = createBCWithMined;
