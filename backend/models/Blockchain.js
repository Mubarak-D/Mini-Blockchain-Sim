const Block = require('./Block');
const Transaction = require('./Transaction');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3; // Number of leading zeros required for PoW
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    // In a real blockchain, you'd select the most valuable transactions from the pool.
    // For simplicity, we just take all of them.
    
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

    // Reset pending transactions pool
    this.pendingTransactions = [];
    return block;
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    if (transaction.amount <= 0) {
      throw new Error('Transaction amount should be higher than 0');
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify the hash is correct based on the block's content
      const blockToVerify = new Block(
          currentBlock.index, 
          currentBlock.timestamp, 
          currentBlock.transactions, 
          currentBlock.previousHash
      );
      blockToVerify.nonce = currentBlock.nonce;

      if (currentBlock.hash !== blockToVerify.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  // Educational helper method to edit a block, ruining the hash integrity
  tamperBlockStringent(index) {
    if (index >= 0 && index < this.chain.length) {
       this.chain[index].transactions.push(new Transaction('hacker', 'thief', 10000));
       // We DO NOT update the hash so let validation fail
    }
  }
}

module.exports = Blockchain;
