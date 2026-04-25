const express = require('express');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');

/**
 * API Routes Factory
 * Accepts a Blockchain instance and returns an Express router
 * with all REST endpoints for the MiniCoin simulator.
 */
module.exports = function(blockchain) {
  const router = express.Router();

  // ─── CHAIN ENDPOINTS ────────────────────────────────────────

  /** GET /api/chain — Returns the full blockchain array */
  router.get('/chain', (req, res) => {
    res.json(blockchain.chain);
  });

  /** GET /api/validate — Checks chain integrity and returns detailed result */
  router.get('/validate', (req, res) => {
    const result = blockchain.isChainValid();
    res.json(result);
  });

  /** GET /api/info — Returns network parameters (difficulty, reward, chain length) */
  router.get('/info', (req, res) => {
    res.json({
      difficulty: blockchain.difficulty,
      miningReward: blockchain.miningReward,
      chainLength: blockchain.chain.length,
      pendingCount: blockchain.pendingTransactions.length
    });
  });

  // ─── WALLET ENDPOINTS ───────────────────────────────────────

  /** POST /api/wallet — Generates a simplified public/private key pair */
  router.post('/wallet', (req, res) => {
    // In real crypto: ECDSA (secp256k1) key pairs are used.
    // Here we generate random hex for educational simplicity.
    const privateKey = crypto.randomBytes(32).toString('hex');
    const publicKey = crypto.createHash('sha256').update(privateKey).digest('hex');
    res.json({ privateKey, publicKey });
  });

  /** GET /api/balance/:address — Calculates wallet balance by scanning chain */
  router.get('/balance/:address', (req, res) => {
    const balance = blockchain.getBalanceOfAddress(req.params.address);
    res.json({ address: req.params.address, balance });
  });

  /** GET /api/transactions/:address — Returns all transactions for an address */
  router.get('/transactions/:address', (req, res) => {
    const transactions = blockchain.getTransactionsOfAddress(req.params.address);
    res.json(transactions);
  });

  // ─── TRANSACTION ENDPOINTS ──────────────────────────────────

  /** POST /api/transaction — Submits a new transaction to the mempool */
  router.post('/transaction', (req, res) => {
    const { fromAddress, toAddress, amount, privateKey } = req.body;
    try {
      const tx = new Transaction(fromAddress, toAddress, parseFloat(amount));
      
      // Sign the transaction before adding it to the blockchain
      if (fromAddress) {
        tx.signTransaction(privateKey);
      }

      blockchain.addTransaction(tx);
      res.json({ message: 'Transaction added to pending pool successfully', transaction: tx });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  /** GET /api/pending — Returns all pending (unmined) transactions */
  router.get('/pending', (req, res) => {
    res.json(blockchain.pendingTransactions);
  });

  // ─── MINING ENDPOINTS ───────────────────────────────────────

  /** POST /api/mine — Mines pending transactions into a new block */
  router.post('/mine', (req, res) => {
    const { rewardAddress } = req.body;
    if (!rewardAddress) {
      return res.status(400).json({ error: 'Reward address is required' });
    }
    const block = blockchain.minePendingTransactions(rewardAddress);
    res.json({ message: 'Block mined successfully', block });
  });

  // ─── ADMIN / DEMO ENDPOINTS ─────────────────────────────────

  /** POST /api/tamper — Injects a fake transaction to break chain integrity */
  router.post('/tamper', (req, res) => {
    const { blockIndex } = req.body;
    if (blockIndex === undefined || blockIndex < 0 || blockIndex >= blockchain.chain.length) {
      return res.status(400).json({ error: 'Invalid block index' });
    }
    blockchain.tamperBlock(blockIndex);
    res.json({ message: `Block ${blockIndex} tampered successfully` });
  });

  /** POST /api/reset — Resets blockchain to genesis state */
  router.post('/reset', (req, res) => {
    blockchain.resetChain();
    res.json({ message: 'Blockchain reset to genesis state' });
  });

  return router;
};
