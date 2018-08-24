/**
 * This File is the Status of Video-1
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
     */
    constructor(timestamp, data, prevHash) {
        this.timestamp = timestamp;
        this.prevHash = prevHash;
        this.data = data;
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
            JSON.stringify(this.data)
        );
    }
}

class BlockChain {
    /**
     * Create a BlockChain
     */
    constructor() {
        /**@type {Block[]} */
        this.chain = [];
        this.createFirstBlock();
    }

    /**
     * Get the Newest (Latest) Block in the Chain
     * @returns {Block} Returns the Requested Block
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
            this.chain.push(new Block(new Date(), 'First Block', 'null'));
    }

    /**
     * Add a new Block to the Chain
     * @param {BlockData} data
     * @returns {void}
     */
    addBlock(data) {
        this.chain.push(
            new Block(new Date(), data, this.getLastBlock().hash)
        );
    }

    /**
     * Checks if the Chain is Valid
     * If it is not, then the invalid Block is given
     * @returns {risChainValid} Returns an Object, b is true if it is valid, otherwise there will be the Erroring block 
     */
    isChainValid() {
        let returnObj = {
            b: true,
            block: null
        };
        this.chain.every((block, index) => {
            if (index == 0) return true;
            const prevBlock = this.chain[index - 1];

            if (block.hash != block.calcHash()) {
                returnObj.b = false;
                returnObj.block = block;
            }

            if (block.prevHash !== prevBlock.hash) {
                returnObj.b = false;
                returnObj.block = block;
            }

            return true;
        });

        return returnObj;
    }
}

const chain = new BlockChain();
chain.addBlock({ amount: 5 });
chain.addBlock({ amount: 10 });

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