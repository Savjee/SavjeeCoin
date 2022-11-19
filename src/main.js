'use strict';
const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Your private key goes here
const myKey = ec.keyFromPrivate(
  '7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf'
);

// From that we can calculate your public key (which doubles as your wallet address)
const myWalletAddress = myKey.getPublic('hex');

// Create new instance of Blockchain class
const savjeeCoin = new Blockchain();

// Mine first block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create a transaction & sign it with your key
const tx1 = new Transaction(myWalletAddress, 'address2', 100);
tx1.signTransaction(myKey);
savjeeCoin.addTransaction(tx1);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx2 = new Transaction(myWalletAddress, 'address1', 50);
tx2.signTransaction(myKey);
savjeeCoin.addTransaction(tx2);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx3 = new Transaction(myWalletAddress, 'address1', 50);
tx3.signTransaction(myKey);
savjeeCoin.addTransaction(tx3);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx4 = new Transaction(myWalletAddress, 'address1', 50);
tx4.signTransaction(myKey);
savjeeCoin.addTransaction(tx4);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx5 = new Transaction(myWalletAddress, 'address1', 50);
tx5.signTransaction(myKey);
savjeeCoin.addTransaction(tx5);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx6 = new Transaction(myWalletAddress, 'address1', 50);
tx6.signTransaction(myKey);
savjeeCoin.addTransaction(tx6);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx7 = new Transaction(myWalletAddress, 'address1', 50);
tx7.signTransaction(myKey);
savjeeCoin.addTransaction(tx7);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx8 = new Transaction(myWalletAddress, 'address1', 50);
tx8.signTransaction(myKey);
savjeeCoin.addTransaction(tx8);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx9 = new Transaction(myWalletAddress, 'address1', 50);
tx9.signTransaction(myKey);
savjeeCoin.addTransaction(tx9);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx10 = new Transaction(myWalletAddress, 'address1', 50);
tx10.signTransaction(myKey);
savjeeCoin.addTransaction(tx10);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx11 = new Transaction(myWalletAddress, 'address1', 50);
tx11.signTransaction(myKey);
savjeeCoin.addTransaction(tx11);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx12 = new Transaction(myWalletAddress, 'address1', 50);
tx12.signTransaction(myKey);
savjeeCoin.addTransaction(tx12);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx13 = new Transaction(myWalletAddress, 'address1', 50);
tx13.signTransaction(myKey);
savjeeCoin.addTransaction(tx12);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

console.log(savjeeCoin.chain);
console.log();
console.log(
  `Balance of xavier is ${savjeeCoin.getBalanceOfAddress(myWalletAddress)}`
);

// Uncomment this line if you want to test tampering with the chain
// savjeeCoin.chain[1].transactions[0].amount = 10;

// Check if the chain is valid
console.log();
console.log('Blockchain valid?', savjeeCoin.isChainValid() ? 'Yes' : 'No');
