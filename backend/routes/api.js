const express = require('express');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');

module.exports = function(blockchain) {
  const router = express.Router();

  // Get the full blockchain
  router.get('/chain', (req, res) => {
    res.json(blockchain.chain);
  });

  // Calculate the balance of a given address
  router.get('/balance/:address', (req, res) => {
    const balance = blockchain.getBalanceOfAddress(req.params.address);
    res.json({ address: req.params.address, balance });
  });

  // Create a new transaction
  router.post('/transaction', (req, res) => {
    const { fromAddress, toAddress, amount } = req.body;
    try {
      const tx = new Transaction(fromAddress, toAddress, parseFloat(amount));
      blockchain.addTransaction(tx);
      res.json({ message: 'Transaction added to pending pool successfully', transaction: tx });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // Mine pending transactions
  router.post('/mine', (req, res) => {
    const { rewardAddress } = req.body;
    if (!rewardAddress) {
      return res.status(400).json({ error: 'Reward address is required' });
    }
    
    // In a real blockchain, mining would be non-blocking/asynchronous, but for educational
    // purposes, this block will block the thread until mining is complete.
    const block = blockchain.minePendingTransactions(rewardAddress);
    res.json({ message: 'Block mined successfully', block });
  });

  // Validate the chain
  router.get('/validate', (req, res) => {
    const isValid = blockchain.isChainValid();
    res.json({ isValid });
  });

  // Generate a simple wallet keypair (simplified)
  router.post('/wallet', (req, res) => {
    // For educational purposes, we're generating simple random hex strings
    // A real implementation would use ECDSA (secp256k1)
    const privateKey = crypto.randomBytes(32).toString('hex');
    const publicKey = crypto.createHash('sha256').update(privateKey).digest('hex');
    res.json({ privateKey, publicKey });
  });

  // Tamper demo endpoint
  router.post('/tamper', (req, res) => {
    const { blockIndex } = req.body;
    blockchain.tamperBlockStringent(blockIndex);
    res.json({ message: `Block ${blockIndex} tampered successfully` });
  });

  // Get pending transactions
  router.get('/pending', (req, res) => {
    res.json(blockchain.pendingTransactions);
  });

  return router;
};
