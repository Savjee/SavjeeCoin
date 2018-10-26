const { Transaction, Block, Blockchain } = require('../src/blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const signingKey = ec.keyFromPrivate('3d6f54430830d388052865b95c10b4aeb1bbe33c01334cf2cfa8b520062a0ce3');

function createSignedTx(){
	const txObject = new Transaction(signingKey.getPublic('hex'), 'wallet2', 10);
    txObject.timestamp = 1;
    txObject.signTransaction(signingKey);

    return txObject;
}

function createBlockchainWithTx(){
	const blockchain = new Blockchain();
	const walletAddr = signingKey.getPublic('hex');
	const validTx = new Transaction(walletAddr, 'b2', 10);
	validTx.signTransaction(signingKey);

	blockchain.addTransaction(validTx);
	blockchain.addTransaction(validTx);
	blockchain.minePendingTransactions(1);

	return blockchain;
}

module.exports.signingKey = signingKey;
module.exports.createSignedTx = createSignedTx;
module.exports.createBlockchainWithTx = createBlockchainWithTx;
