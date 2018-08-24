/**
 * This File is the Status of Video-2
 * 
 * This Video was about "mining"
 */

/*=============== This Section is for JSDOC creations ===============*/
/**
 * @typedef {object} risChainValid
 * @property {boolean} b Indicates if it is vaild
 * @property {Block | null} block The Block that is not Valid (otherwise null)
 */
/**
 * @typedef {object} BlockData
 * @property {number} amount
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
 * This is a Block, what is a Component of the Chain
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
     * @returns {string} returns the Calculated String
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
     */
    constructor(difficulty = 1) {
        /**@type {Block[]} */
        this.chain = [];
        this.createFirstBlock();
        this.difficulty = 0;
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
     * Get the Newest (Latest) Block in the Chain
     * @returns {Block} Returns the requested Block
     */
    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * This creates the First Block in the Chain
     * @returns {void}
     */
    createFirstBlock() {
        if (this.chain.length == 0)
            this.chain.push(
                new Block(new Date(), 'First Block', 'null')
            );
    }

    /**
     * Add a new Block to the Chain
     * @param {BlockData} data
     * @param {number} nonce (optional, default 0) set the starting nonce
     * @returns {void}
     */
    addBlock(data, nonce = 0) {
        console.log('Mining new Block...');
        const nBlock = new Block(new Date(), data, this.getLastBlock().hash, nonce);
        nBlock.mineBlock(this.difficulty);

        console.log(`Block Mined: ${nBlock.hash} Index ${this.chain.length+1}`);
        //simple check if this block already exists
        /* i dont know if it will happens, but i added it as safety*/
        if (this.chain.findIndex(v => v.hash == nBlock.hash) >= 0)
            console.log(`Block ${nBlock.hash} already exists`);
        else this.chain.push(nBlock);
    }

    /**
     * Checks if the Chain is Valid
     * If it is not, then the invalid Block is given
     * @returns {risChainValid} Returns an Object, b is true if it is valid, otherwise it will inlcude the Erroring Block
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

const chain = new BlockChain(4);
chain.addBlock({ amount: 5 });
chain.addBlock({ amount: 10 }, 10);

function makeString() {
    let t = chain.isChainValid();
    console.log(`Is the BlockChain Valid?`);
    console.log(t.b ? 'yes' : 'no');
    if (!t.b) console.log(t.block);
}

makeString();

console.log('Modifying Block...');
chain.chain[1].data = { amount: 100 };

makeString();