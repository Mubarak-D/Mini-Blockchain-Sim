const Block = require('./Block');
const Transaction = require('./Transaction');

/**
 * Blockchain - The core data structure that maintains an ordered list of blocks.
 *
 * Key concepts demonstrated:
 * - Genesis Block: The first block in the chain, created with no previous hash.
 * - Proof of Work: Mining requires finding a hash with N leading zeros.
 * - Immutability: Each block's hash depends on the previous block's hash,
 *   so tampering with any block invalidates all subsequent blocks.
 * - Consensus: isChainValid() checks every link in the chain.
 */
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3;               // Number of leading zeros required for PoW
    this.pendingTransactions = [];     // Transactions waiting to be mined
    this.miningReward = 100;           // MiniCoin reward given to the miner
  }

  /**
   * createGenesisBlock - Creates the very first block in the chain.
   * The genesis block has no predecessor, so previousHash is set to "0".
   */
  createGenesisBlock() {
    return new Block(0, Date.now(), [], '0');
  }

  /** Returns the most recently added block. */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * minePendingTransactions - Bundles all pending transactions into a new block
   * and performs Proof of Work to add it to the chain.
   *
   * A reward transaction is appended to compensate the miner.
   * After mining, the pending pool is cleared.
   *
   * @param {string} miningRewardAddress - Public key of the miner
   * @returns {Block} The newly mined block
   */
  minePendingTransactions(miningRewardAddress) {
    // Append mining reward transaction (fromAddress is null = system-generated)
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      this.getLatestBlock().index + 1,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    block.mineBlock(this.difficulty);
    this.chain.push(block);

    // Clear the mempool after successful mining
    this.pendingTransactions = [];
    return block;
  }

  /**
   * addTransaction - Validates and adds a transaction to the pending pool (mempool).
   * @param {Transaction} transaction
   */
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }
    if (transaction.amount <= 0) {
      throw new Error('Transaction amount should be higher than 0');
    }
    
    // Ensure the transaction is signed
    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain (unsigned)');
    }

    this.pendingTransactions.push(transaction);
  }

  /**
   * getBalanceOfAddress - Scans the ENTIRE blockchain to calculate a wallet's balance.
   *
   * In a real blockchain, UTXO sets or account-state trees are used for efficiency.
   * Here we iterate all blocks and sum up sent/received amounts.
   *
   * @param {string} address - Public key to check
   * @returns {number} Current balance
   */
  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address) balance -= tx.amount;
        if (tx.toAddress === address)   balance += tx.amount;
      }
    }
    return balance;
  }

  /**
   * getTransactionsOfAddress - Returns all transactions involving a given address,
   * tagged as 'sent' or 'received' for display purposes.
   *
   * @param {string} address
   * @returns {{type: string, from: string, to: string, amount: number, timestamp: number, blockIndex: number}[]}
   */
  getTransactionsOfAddress(address) {
    const results = [];
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address || tx.toAddress === address) {
          results.push({
            type: tx.fromAddress === address ? 'sent' : 'received',
            from: tx.fromAddress,
            to: tx.toAddress,
            amount: tx.amount,
            timestamp: tx.timestamp,
            blockIndex: block.index
          });
        }
      }
    }
    return results;
  }

  /**
   * isChainValid - Verifies the integrity of the entire blockchain.
   *
   * For each block (starting from index 1), it:
   * 1. Recalculates the hash and compares it to the stored hash.
   *    → Detects data tampering within a block.
   * 2. Checks that previousHash matches the prior block's hash.
   *    → Detects breaks in the chain linkage.
   *
   * Returns a detailed result object instead of a simple boolean, so the
   * frontend can highlight exactly which block is broken and why.
   *
   * @returns {{ isValid: boolean, brokenBlockIndex: number|null, reason: string|null }}
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Rebuild the hash from scratch to detect internal tampering
      const verifier = new Block(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.transactions,
        currentBlock.previousHash
      );
      verifier.nonce = currentBlock.nonce;

      if (currentBlock.hash !== verifier.calculateHash()) {
        return {
          isValid: false,
          brokenBlockIndex: i,
          reason: `Block #${i} has been tampered — stored hash does not match recalculated hash.`
        };
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          isValid: false,
          brokenBlockIndex: i,
          reason: `Block #${i} has a broken chain link — previousHash does not match Block #${i - 1}'s hash.`
        };
      }
    }

    return { isValid: true, brokenBlockIndex: null, reason: null };
  }

  /**
   * tamperBlock - Educational demo: injects a fake transaction into a block
   * WITHOUT recalculating the hash, intentionally breaking the chain.
   *
   * @param {number} index - Block index to tamper with
   */
  tamperBlock(index) {
    if (index >= 0 && index < this.chain.length) {
      this.chain[index].transactions.push(
        new Transaction('hacker', 'thief', 10000)
      );
      // Deliberately NOT recalculating the hash — this is what validation catches
    }
  }

  /**
   * resetChain - Wipes the entire blockchain and starts fresh with a new genesis block.
   * Also clears any pending transactions.
   */
  resetChain() {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
  }
}

module.exports = Blockchain;
