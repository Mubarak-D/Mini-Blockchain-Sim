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
}

module.exports = Transaction;
