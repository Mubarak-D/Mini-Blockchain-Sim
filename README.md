# MiniCoin — A Cryptocurrency & Blockchain Simulator

MiniCoin is an educational, full-stack application built to demonstrate the core mechanics of a blockchain system. It avoids complex databases and focuses purely on simulating how a distributed ledger functions internally using memory and hashing.

## Features

- **Blockchain Structure:** Blocks contain transactions, timestamps, previous hashes, and nonces.
- **Hashing Function:** Utilizes SHA-256 for mathematical security.
- **Proof of Work:** Implements a mining simulator with difficulty scaling.
- **Transactions:** Create multiple transactions that are added to a Mempool.
- **Wallet System:** Demonstrates simple public/private key cryptography for addresses.
- **Validation & Tampering:** Tamper with data and observe how the chain's integrity validation fails.
- **Modern UI:** Features a glassmorphism and neon-styled dashboard for a visual, hands-on experience.

## Tech Stack

- **Backend:** Node.js, Express.js, Crypto (SHA-256)
- **Frontend:** HTML5, CSS3 Variables, Vanilla JavaScript

## How Blockchain Works (Simplified)

1. **Transactions:** Users broadcast transactions containing `from`, `to`, and `amount` data. These wait in the Mempool.
2. **Mining (Proof of Work):** Miners collect transactions and attempt to calculate a specific, difficult-to-find Hash (by changing a `nonce` value).
3. **Block Creation:** Once a valid hash is found, the new block (along with its previous block's hash) is appended to the chain.
4. **Validation:** To easily tell if a record was altered in the past, blockchains use the *Previous Hash*. Changing any transaction data changes that block's hash, which breaks the link to all subsequent blocks.

## How to Run the Project

Ensure you have [Node.js](https://nodejs.org/) installed.

1. Navigate to the `minicoin` folder:
   ```bash
   cd minicoin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node backend/server.js
   ```
4. Open your browser and go to `http://localhost:3000`

## API Endpoints

- `GET /api/chain` - Returns the entire blockchain
- `GET /api/validate` - Checks the blockchain for tampering
- `GET /api/balance/:address` - Returns the balance of an address
- `GET /api/pending` - Returns pending transactions
- `POST /api/transaction` - Broadcasts a new transaction
- `POST /api/mine` - Mines pending transactions into a block
- `POST /api/wallet` - Generates a new key pair
- `POST /api/tamper` - Tampers with block 1 to show validation logic

## What I Learned

<!-- Placeholder for user reflections -->
*Building this simulator solidified my understanding of Proof of Work and why linked SHA-256 hashes make distributed ledgers immutable.*
