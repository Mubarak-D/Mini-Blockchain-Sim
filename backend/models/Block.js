const crypto = require('crypto');

/**
 * Block - A single unit in the blockchain.
 *
 * Each block contains a list of transactions, a reference to the previous block's
 * hash (forming the "chain"), and its own hash computed via SHA-256.
 *
 * The `nonce` field is incremented during mining until the hash meets the
 * difficulty target (Proof of Work).
 */
class Block {
  /**
   * @param {number} index - Position of this block in the chain
   * @param {number} timestamp - Unix timestamp of block creation
   * @param {Transaction[]} transactions - Array of transactions included in this block
   * @param {string} previousHash - Hash of the preceding block
   */
  constructor(index, timestamp, transactions, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  /**
   * calculateHash - Produces a SHA-256 digest of all block fields.
   *
   * SHA-256 is a one-way cryptographic function: given the same input it always
   * produces the same 64-character hex output, but you cannot reverse-engineer
   * the input from the output. Any tiny change in input produces a completely
   * different hash — this is what makes tampering detectable.
   *
   * @returns {string} 64-char hex SHA-256 hash
   */
  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
      )
      .digest('hex');
  }

  /**
   * mineBlock - Proof of Work implementation.
   *
   * Repeatedly increments the nonce and recalculates the hash until the hash
   * starts with `difficulty` number of leading zeros.
   *
   * Example: difficulty = 3 → hash must start with "000"
   *
   * This is computationally expensive by design — it's what makes blockchains
   * resistant to spam and manipulation. In Bitcoin, difficulty adjusts every
   * 2016 blocks to maintain ~10 min block times.
   *
   * @param {number} difficulty - Number of leading zeros required
   */
  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

module.exports = Block;
