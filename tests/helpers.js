const { Transaction } = require('../src/blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const signingKey = ec.keyFromPrivate('3d6f54430830d388052865b95c10b4aeb1bbe33c01334cf2cfa8b520062a0ce3');


module.exports.createSignedTx = function(){
	txObject = new Transaction(signingKey.getPublic('hex'), 'wallet2', 10);
    txObject.timestamp = 1;
    txObject.signTransaction(signingKey);

    return txObject;
}

module.exports.signingKey = function(){
	return signingKey;
}