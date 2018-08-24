/**
 * This File is the Status of Video-3
 * 
 * This Video was about mining rewards & multiple transactions
 */

/*=============== This Section is for JSDOC creations ===============*/
/**
 * @typedef {object} risChainValid
 * @property {boolean} b Indicates if it is vaild
 * @property {Block | null} block The Block that is not Valid (otherwise null)
 */
/**
 * @typedef {object} BlockData
 * @property {Transaction[]} tansactions
 */
/*=============== end of JSDOC creations ===============*/

const crypto = require('crypto');

/**
 * Create a sha-256 hash
 * @param {string} input
 * @returns {string} Returns the SHA String
 */
function SHA256(input = '') {
    return crypto.createHmac('sha256', 'a secret salt').update(input).digest('hex');
}

/**
 * This is a Transaction
 */
class Transaction {
    /**
     * Create a Transaction
     * @param {string} fromAddr
     * @param {string} toAddr
     * @param {number} amount
     */
    constructor(fromAddr, toAddr, amount) {
        this.fromAddr = fromAddr;
        this.toAddr = toAddr;
        if (amount <= 0) {
            console.log(`"${amount}" is too low it must be over 0`);
            this.amount = 0.00000001; // because this is an example, set an amount
        } else this.amount = amount;
    }
}

/**
 * This is a Block
 */
class Block {
    /**
     * Create a new Block
     * @param {Date} timestamp
     * @param {BlockData} data
     * @param {string} prevHash
     * @param {number} nonce (optional, default 0) set the starting nonce
     */
    constructor(timestamp, data, prevHash, nonce = 0) {
        this.timestamp = timestamp;
        this.prevHash = prevHash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = 0;
        this.hash = this.calcHash();
    }

    /**
     * Calculate a Hash
     * @returns {string} Returns the Calculated SHA String
     */
    calcHash() {
        return SHA256(
            this.prevHash +
            this.timestamp +
            this.nonce +
            JSON.stringify(this.data)
        );
    }

    /**
     * Mines a Block
     * @param {number} difficulty The Difficulty it is mined on
     * @returns {void}
     */
    mineBlock(difficulty) {
        this.difficulty = difficulty;
        while (this.hash.substr(0, difficulty) !== Array(difficulty + 1).join('0')) {
            // +1 is needed for the join otherwise it will be one "0" less
            this.nonce++;
            this.hash = this.calcHash();
        }
    }
}

class BlockChain {
    /**
     * Create a BlockChain
     * @param {number} difficulty The Difficulty of the BlockChain (default 1)
     * @param {number} miningReward The Reward that a Miner gets when a block is created
     */
    constructor(difficulty = 1, miningReward = 10) {
        /**@type {Block[]} */
        this.chain = [];
        /**@type {Transaction[]} */
        this.pendingTransactions = [];
        this.createFirstBlock();
        this.difficulty = 0;
        this.miningReward = 0;

        this.changeReward(miningReward);
        this.changeDifficulty(difficulty);
    }

    /**
     * Changes the difficulty
     * @param {number} difficulty
     * @returns {void}
     */
    changeDifficulty(difficulty) {
        if (difficulty > 63) {
            console.log(`"${difficulty}" is too high (a sha256 hash is the length of 64 so it must be 63 or below!)`);
            this.difficulty = 63;
            return;
        }
        if (difficulty <= 0) {
            console.log(`"${difficulty}" is too low (it must be 1 or higher!)`);
            this.difficulty = 1;
            return;
        }
        this.difficulty = difficulty;
    }

    /**
     * Change the Mining Reward
     * @param {number} amount
     * @returns {void}
     */
    changeReward(amount) {
        if (amount <= 0) {
            console.log(`"${amount}" is too low (it must be 1 or higher!)`);
            this.miningReward = 1;
            return;
        }

        this.miningReward = amount;
    }

    /**
     * Add a Transaction to the pending list
     * @param {Transaction} ts
     * @returns {void}
     */
    addTransaction(ts) {
        this.pendingTransactions.push(ts);
    }

    /**
     * Get the Current Balance of an Address
     * @param {string} address
     * @returns {number} Returns the Balance of the Requested Address
     */
    getBalance(address) {
        let balance = 0;

        this.chain.forEach(block => {
            block.data.tansactions.forEach(v => {
                if (v.fromAddr == address)
                    balance -= v.amount;

                if (v.toAddr == address)
                    balance += v.amount;
            });
        });

        return balance;
    }

    /**
     * Get the Newest (Latest) Block in the Chain
     * @returns {Block} Returns the Block
     */
    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * This creates the First Block in the Chain
     * @returns {void}
     */
    createFirstBlock() {
        // easy check that there are no multiple "First Block"'s
        if (this.chain.length == 0)
            this.chain.push(
                new Block(new Date(), { tansactions: [] }, 'null')
            );
    }

    /**
     * Start a Mining Process (once)
     * @param {string} rewardAddr The Address where the mining Reward should go
     * @param {BlockData} data To add additonal Data
     * @returns {void}
     */
    mine(rewardAddr, data = {}) {
        const tsPerBlock = 10;
        console.log('Mining new Block...');
        if (this.pendingTransactions <= 4) { // only mine a block if there are more than 4 Transactions pending
            console.log('Cannot mine a Block, there must be at least 5 transactions in the list!');
            return;
        }

        data.tansactions = this.pendingTransactions.slice(0, tsPerBlock); // only take 10 transactions per Block
        data.tansactions.push( // adding the miner reward
            new Transaction(null, rewardAddr, this.miningReward)
        );
        const nBlock = new Block(new Date(), data, this.getLastBlock().hash);
        nBlock.mineBlock(this.difficulty);

        console.log(`Block Mined: ${nBlock.hash} Index ${this.chain.length + 1}`);
        //simple check if this block already exists
        /* i dont know if it will happens, but i added it as safety*/
        if (this.chain.findIndex(v => v.hash == nBlock.hash) >= 0)
            console.log(`Block ${nBlock.hash} already exists`);
        else {
            this.pendingTransactions.splice(0, tsPerBlock);
            this.chain.push(nBlock);
        }
    }

    /**
     * Checks if the Chain is Valid
     * If it is not, then the invalid Block is given
     * @returns {risChainValid} Returns an Object, b is true if it is valid, otherwise it includes the Block
     */
    isChainValid() {
        //TODO: add a check if it is real work
        let returnObj = {
            b: true,
            block: null
        };
        this.chain.every((block, index) => {
            if (index == 0) return true; // ignore the first block
            const prevBlock = this.chain[index - 1];

            if (block.hash != block.calcHash()) {
                returnObj.b = false;
                returnObj.block = block;
                console.log(`Block ${block.hash} does not match the recalculated hash!`);
            }

            if (block.prevHash !== prevBlock.hash) {
                returnObj.b = false;
                returnObj.block = block;
                console.log(`Block ${block.hash}'s previous Block hash does not match with the Block Before!`);
            }

            if (block.hash.substr(0, block.difficulty) !== Array(block.difficulty + 1).join('0')) {
                returnObj.b = false;
                returnObj.block = block;
                console.log(`Block ${block.hash} does not meet the difficulty at that time!`);
            }

            return returnObj.b; // less code, because it will be settet in the if's
        });

        return returnObj;
    }
}

/**
 * This is only a function to make the string generation short
 * @returns {void}
 */
function makeString() {
    const t = chain.isChainValid();
    console.log(`Is the BlockChain Valid?`);
    console.log(t.b ? 'yes' : 'no');
    if (!t.b) console.log(t.block);
}

const chain = new BlockChain(4);
chain.mine('someone'); // demo of below 5 transactions

for (var i = 0; i < 15; i++) { // create some transactions
    chain.addTransaction(
        new Transaction(SHA256(i.toString()), SHA256((i + 1).toString()), Math.random())
    );
}
chain.mine('Savjee');
chain.mine('hasezoey');

console.log(chain.chain[2].data.tansactions); // Log the Block of "hasezoey"

console.log(`The Balance of hasezoey is ${chain.getBalance('hasezoey')}`);
console.log(`The Balance of Savjee is ${chain.getBalance('Savjee')}`);

makeString();

console.log('Modifying Block...');
chain.chain[1].data = { amount: 100 };

makeString();