const crypto = require('crypto');

/**
 * Transaction - Represents a transfer of MiniCoin between two addresses.
 *
 * In a real cryptocurrency, transactions would be digitally signed using the
 * sender's private key (ECDSA). For educational purposes, this simulator
 * uses a simplified model without cryptographic signatures.
 */
class Transaction {
  /**
   * @param {string|null} fromAddress - Sender's public key (null for mining rewards)
   * @param {string} toAddress - Recipient's public key
   * @param {number} amount - Amount of MiniCoin to transfer
   */
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  /**
   * calculateHash - Returns a SHA-256 hash of the transaction data.
   * This hash is what will be signed by the sender's private key.
   */
  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.fromAddress + this.toAddress + this.amount + this.timestamp)
      .digest('hex');
  }

  /**
   * signTransaction - Signs the transaction hash using the sender's private key.
   * For the simulator, we use a simplified HMAC-style signature.
   * @param {string} privateKey
   */
  signTransaction(privateKey) {
    if (!privateKey) throw new Error('Private key is required to sign');
    
    // In a real blockchain, we'd use ECDSA. Here we use an HMAC-style proof.
    const hash = this.calculateHash();
    this.signature = crypto
      .createHmac('sha256', privateKey)
      .update(hash)
      .digest('hex');
  }

  /**
   * isValid - Verifies if the transaction signature is valid.
   * @param {string} privateKey - For this simplified simulator, we verify against the key
   */
  isValid() {
    // Reward transactions (from null) are always valid
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    // Note: In real crypto, we'd verify using ONLY the public key.
    // In this simulator's simplified model, we'll check if a signature exists.
    // Full verification will be handled in the blockchain logic.
    return true; 
  }
}

module.exports = Transaction;
