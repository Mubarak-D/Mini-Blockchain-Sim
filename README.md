# 🪙 MiniCoin — Cryptocurrency & Blockchain Simulator

> An educational full-stack application that demonstrates how blockchain technology works under the hood — from Proof of Work mining to tamper detection.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📖 Overview

MiniCoin is **not** a real cryptocurrency. It is a hands-on simulator built to help developers understand the core mechanics that power systems like Bitcoin and Ethereum:

- How blocks are linked together using cryptographic hashes
- Why Proof of Work makes mining computationally expensive
- How tampering with a single block breaks the entire chain
- How wallets and balances work on a blockchain

Everything runs in-memory with zero external dependencies beyond Express.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Blockchain Engine** | Full chain with genesis block, SHA-256 hashing, and block linking |
| **Proof of Work** | Adjustable difficulty mining with nonce incrementation |
| **Visual Mining** | Live overlay showing nonce ticking and hash searching in real-time |
| **Wallet System** | Generate simplified public/private key pairs |
| **Transactions** | Create, queue (mempool), and mine transactions into blocks |
| **Mining Rewards** | Miners receive 100 MC per successfully mined block |
| **Balance Tracking** | Dynamically calculated by scanning the entire chain |
| **Transaction History** | Filter and view all sent/received transactions for any address |
| **Chain Validation** | Verify integrity of every block and every hash link |
| **Tamper Detection** | Inject a fake transaction and watch validation fail with details |
| **Reset Blockchain** | Wipe everything and start fresh from genesis |
| **Toast Notifications** | Non-intrusive feedback for every user action |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express.js |
| Frontend | HTML5, CSS3 (Vanilla), JavaScript (Vanilla) |
| Hashing | Node.js `crypto` module (SHA-256) |
| Storage | In-memory (no database) |
| UI Theme | Dark mode, Glassmorphism, Neon accents |

---

## 🧠 How Blockchain Works

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Block #0 │───▶│ Block #1 │───▶│ Block #2 │
│ (Genesis)│    │          │    │          │
│          │    │ prevHash │    │ prevHash │
│ hash: a1 │    │ = a1     │    │ = b2     │
│          │    │ hash: b2 │    │ hash: c3 │
└──────────┘    └──────────┘    └──────────┘
```

1. **Transactions** are broadcast and wait in the **mempool** (pending pool).
2. A **miner** bundles pending transactions into a candidate block.
3. The miner performs **Proof of Work**: incrementing a `nonce` value and recalculating the SHA-256 hash until it starts with N leading zeros (the **difficulty**).
4. Once a valid hash is found, the block is **appended** to the chain with a pointer (`previousHash`) to the last block.
5. **Tampering** with any block changes its hash, which breaks the `previousHash` link in the next block — this cascading failure is what makes blockchains immutable.

---

## 🚀 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v16+ installed

### Installation

```bash
# Clone the repository
git clone https://github.com/Mubarak-D/Mini-Blockchain-Sim.git
cd Mini-Blockchain-Sim

# Install dependencies
npm install

# Start the server
node backend/server.js
```

Open your browser and navigate to **http://localhost:3000**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chain` | Returns the full blockchain |
| `GET` | `/api/validate` | Validates chain integrity (returns details) |
| `GET` | `/api/info` | Returns network parameters (difficulty, reward) |
| `GET` | `/api/balance/:address` | Calculates wallet balance |
| `GET` | `/api/transactions/:address` | Returns transaction history for an address |
| `GET` | `/api/pending` | Returns pending transactions |
| `POST` | `/api/wallet` | Generates a new key pair |
| `POST` | `/api/transaction` | Submits a transaction to the mempool |
| `POST` | `/api/mine` | Mines pending transactions into a block |
| `POST` | `/api/tamper` | Tampers with a block (demo only) |
| `POST` | `/api/reset` | Resets blockchain to genesis state |

### Example: Create a Transaction

```bash
curl -X POST http://localhost:3000/api/transaction \
  -H "Content-Type: application/json" \
  -d '{"fromAddress": "alice123", "toAddress": "bob456", "amount": 50}'
```

---

## 🎮 Demo Steps

1. **Generate a Wallet** — Click "Generate Key Pair" to create your address
2. **Send a Transaction** — Enter a recipient address and amount, click "Send to Mempool"
3. **Mine a Block** — Click "⛏️ Mine Block" and watch the live mining overlay
4. **Check Balance** — Your wallet balance updates automatically after mining
5. **View History** — Enter your address in Transaction History to see all activity
6. **Tamper a Block** — Click "Tamper Block 1" to inject a fake transaction
7. **Validate Chain** — Click "Validate Chain" to see the broken block highlighted in red
8. **Reset** — Click "Reset Blockchain" to start over

---

## 📂 Project Structure

```
minicoin/
├── backend/
│   ├── models/
│   │   ├── Block.js          # Block class with SHA-256 hashing & PoW
│   │   ├── Blockchain.js     # Core chain logic, validation, balance
│   │   └── Transaction.js    # Transaction data model
│   ├── routes/
│   │   └── api.js            # Express REST API endpoints
│   └── server.js             # Express server setup
├── frontend/
│   ├── index.html            # Main UI structure
│   ├── style.css             # Dark theme with glassmorphism
│   └── script.js             # Client-side logic & mining visuals
├── .gitignore
├── package.json
└── README.md
```

---

## 💡 What I Learned

Building this simulator deepened my understanding of:

- **SHA-256 Hashing**: How one-way cryptographic functions create unique fingerprints for data, and why even a single-bit change produces a completely different hash.
- **Proof of Work**: The brute-force process of finding a hash with N leading zeros — computationally expensive to produce, trivial to verify.
- **Chain Immutability**: How linking blocks via `previousHash` creates a cascade where tampering with one block invalidates all subsequent blocks.
- **Mempool Architecture**: How transactions wait in a pool before being selected and bundled into blocks by miners.
- **Full-Stack Architecture**: Building a clean REST API that separates concerns (models → routes → server) while serving a modern frontend.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built for learning. Not for trading.* 🚀
