// ═══════════════════════════════════════════════════════════════
// MiniCoin Frontend — Blockchain Simulator UI Logic
// ═══════════════════════════════════════════════════════════════

const API_BASE = '/api';

// ── DOM Element References ────────────────────────────────────
const els = {
  // Wallet
  generateWalletBtn: document.getElementById('generateWalletBtn'),
  publicKey:         document.getElementById('publicKey'),
  privateKey:        document.getElementById('privateKey'),
  copyPublicBtn:     document.getElementById('copyPublicBtn'),
  copyPrivateBtn:    document.getElementById('copyPrivateBtn'),
  walletBalance:     document.getElementById('walletBalance'),

  // Transaction
  txFrom:    document.getElementById('txFrom'),
  txTo:      document.getElementById('txTo'),
  txAmount:  document.getElementById('txAmount'),
  sendTxBtn: document.getElementById('sendTxBtn'),

  // Mining
  pendingCount:     document.getElementById('pendingCount'),
  mempoolList:      document.getElementById('mempoolList'),
  mineRewardAddress: document.getElementById('mineRewardAddress'),
  mineBtn:          document.getElementById('mineBtn'),

  // Mining overlay
  miningOverlay:    document.getElementById('miningOverlay'),
  miningNonce:      document.getElementById('miningNonce'),
  miningHash:       document.getElementById('miningHash'),
  overlayDifficulty: document.getElementById('overlayDifficulty'),

  // Validation
  validateBtn:      document.getElementById('validateBtn'),
  tamperBtn:        document.getElementById('tamperBtn'),
  resetBtn:         document.getElementById('resetBtn'),
  validationResult: document.getElementById('validationResult'),

  // Explorer
  blockchainDisplay: document.getElementById('blockchainDisplay'),

  // Network bar
  networkDifficulty:  document.getElementById('networkDifficulty'),
  difficultyTarget:   document.getElementById('difficultyTarget'),
  chainLength:        document.getElementById('chainLength'),
  miningRewardDisplay: document.getElementById('miningRewardDisplay'),

  // Transaction history
  historyAddress: document.getElementById('historyAddress'),
  historyBtn:     document.getElementById('historyBtn'),
  historyResults: document.getElementById('historyResults'),
};

// ── State ─────────────────────────────────────────────────────
let wallet = { public: '', private: '' };
let networkDifficulty = 3;
let brokenBlockIndex = null; // Track which block failed validation

// ── Toast Notification System ─────────────────────────────────
function createToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'info') {
  const container = createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── Event Listeners ───────────────────────────────────────────
els.generateWalletBtn.addEventListener('click', generateWallet);
els.sendTxBtn.addEventListener('click', sendTransaction);
els.mineBtn.addEventListener('click', mineBlock);
els.validateBtn.addEventListener('click', validateChain);
els.tamperBtn.addEventListener('click', tamperBlock);
els.resetBtn.addEventListener('click', resetBlockchain);
els.historyBtn.addEventListener('click', searchHistory);

// Copy listeners
els.copyPublicBtn.addEventListener('click', () => copyToClipboard(els.publicKey.value, 'Address'));
els.copyPrivateBtn.addEventListener('click', () => copyToClipboard(els.privateKey.value, 'Private Key'));

async function copyToClipboard(text, label) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  } catch (err) {
    showToast('Failed to copy', 'error');
  }
}

// ── Initial Load ──────────────────────────────────────────────
fetchNetworkInfo();
fetchChain();
fetchPending();

// ═══════════════════════════════════════════════════════════════
// WALLET
// ═══════════════════════════════════════════════════════════════

async function generateWallet() {
  try {
    const res = await fetch(`${API_BASE}/wallet`, { method: 'POST' });
    const data = await res.json();

    wallet.public = data.publicKey;
    wallet.private = data.privateKey;

    els.publicKey.value = data.publicKey;
    els.privateKey.value = data.privateKey;

    // Auto-fill related fields
    els.txFrom.value = data.publicKey;
    els.mineRewardAddress.value = data.publicKey;

    await updateBalance(data.publicKey);
    showToast('Wallet generated successfully!', 'success');
  } catch (e) {
    showToast('Error generating wallet', 'error');
  }
}

async function updateBalance(address) {
  if (!address) return;
  try {
    const res = await fetch(`${API_BASE}/balance/${address}`);
    const data = await res.json();
    els.walletBalance.textContent = `${data.balance} MC`;
  } catch (e) {
    console.error('Error fetching balance', e);
  }
}

// ═══════════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════════

async function sendTransaction() {
  const tx = {
    fromAddress: els.txFrom.value,
    toAddress:   els.txTo.value,
    amount:      els.txAmount.value
  };

  if (!tx.fromAddress || !tx.toAddress || !tx.amount) {
    showToast('Please fill out all transaction fields', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    showToast('Transaction added to mempool!', 'success');
    els.txTo.value = '';
    els.txAmount.value = '';
    fetchPending();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ═══════════════════════════════════════════════════════════════
// MINING — Visual Simulation
// ═══════════════════════════════════════════════════════════════

let miningInterval = null;

/**
 * startMiningVisuals - Creates a visual simulation of mining on the frontend.
 *
 * While the backend performs real PoW (incrementing nonce until hash has N
 * leading zeros), the frontend shows a simulated version:
 * - A random nonce increments rapidly
 * - A random SHA-256-like hex string flashes
 *
 * This makes mining feel alive and demonstrates the concept of "brute force
 * searching" for a valid hash.
 */
function startMiningVisuals() {
  els.miningOverlay.classList.remove('hidden');
  els.overlayDifficulty.textContent = networkDifficulty;
  let fakeNonce = 0;

  miningInterval = setInterval(() => {
    fakeNonce += Math.floor(Math.random() * 150) + 50;
    els.miningNonce.textContent = fakeNonce.toLocaleString();

    // Generate a random hex string that looks like a SHA-256 hash
    const randomHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    els.miningHash.textContent = randomHash;
  }, 80);
}

function stopMiningVisuals(minedBlock) {
  clearInterval(miningInterval);
  miningInterval = null;

  // Show the real result briefly before closing overlay
  if (minedBlock) {
    els.miningNonce.textContent = minedBlock.nonce.toLocaleString();
    els.miningHash.textContent = minedBlock.hash;
  }

  setTimeout(() => {
    els.miningOverlay.classList.add('hidden');
  }, 1200);
}

async function mineBlock() {
  const rewardAddress = els.mineRewardAddress.value;
  if (!rewardAddress) {
    showToast('Please specify a reward address', 'error');
    return;
  }

  els.mineBtn.disabled = true;
  startMiningVisuals();

  try {
    const res = await fetch(`${API_BASE}/mine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardAddress })
    });

    const data = await res.json();
    stopMiningVisuals(data.block);

    showToast(`Block #${data.block.index} mined! Nonce: ${data.block.nonce}`, 'success');

    // Refresh all data
    fetchChain();
    fetchPending();
    fetchNetworkInfo();
    if (wallet.public) updateBalance(wallet.public);

    // Clear old validation result
    brokenBlockIndex = null;
    els.validationResult.textContent = '';
    els.validationResult.className = 'status-indicator';
  } catch (e) {
    stopMiningVisuals(null);
    showToast('Mining failed', 'error');
  } finally {
    els.mineBtn.disabled = false;
  }
}

// ═══════════════════════════════════════════════════════════════
// NETWORK INFO
// ═══════════════════════════════════════════════════════════════

async function fetchNetworkInfo() {
  try {
    const res = await fetch(`${API_BASE}/info`);
    const data = await res.json();

    networkDifficulty = data.difficulty;
    els.networkDifficulty.textContent = data.difficulty;
    els.difficultyTarget.textContent = '0'.repeat(data.difficulty);
    els.chainLength.textContent = data.chainLength;
    els.miningRewardDisplay.textContent = data.miningReward;
    els.pendingCount.textContent = data.pendingCount;
  } catch (e) {
    console.error('Error fetching network info', e);
  }
}

async function fetchPending() {
  try {
    const res = await fetch(`${API_BASE}/pending`);
    const pending = await res.json();
    els.pendingCount.textContent = pending.length;

    // Render mempool list
    if (pending.length === 0) {
      els.mempoolList.innerHTML = '';
      return;
    }

    els.mempoolList.innerHTML = pending.map(tx => {
      const from = tx.fromAddress ? tx.fromAddress.substring(0, 8) + '...' : 'System';
      const to = tx.toAddress.substring(0, 8) + '...';
      return `
        <div class="mempool-item">
          <span>${from} → ${to}</span>
          <span class="amount">${tx.amount} MC</span>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error(e);
  }
}

// ═══════════════════════════════════════════════════════════════
// CHAIN VALIDATION
// ═══════════════════════════════════════════════════════════════

async function validateChain() {
  try {
    const res = await fetch(`${API_BASE}/validate`);
    const data = await res.json();

    if (data.isValid) {
      brokenBlockIndex = null;
      els.validationResult.innerHTML = '✅ Chain is VALID — All hashes verified';
      els.validationResult.className = 'status-indicator status-valid';
      showToast('Blockchain integrity verified!', 'success');
    } else {
      brokenBlockIndex = data.brokenBlockIndex;
      els.validationResult.innerHTML =
        `❌ Chain is INVALID<br><small>${data.reason}</small>`;
      els.validationResult.className = 'status-indicator status-invalid';
      showToast(`Tampering detected at Block #${data.brokenBlockIndex}!`, 'error');
    }

    // Re-render chain to highlight the broken block
    fetchChain();
  } catch (e) {
    showToast('Validation request failed', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════
// TAMPER & RESET
// ═══════════════════════════════════════════════════════════════

async function tamperBlock() {
  try {
    await fetch(`${API_BASE}/tamper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockIndex: 1 })
    });

    showToast('Block #1 tampered with malicious transaction!', 'error');
    fetchChain();
  } catch (e) {
    showToast('Tamper failed — mine a block first', 'error');
  }
}

async function resetBlockchain() {
  if (!confirm('Reset the entire blockchain? This cannot be undone.')) return;

  try {
    await fetch(`${API_BASE}/reset`, { method: 'POST' });

    brokenBlockIndex = null;
    wallet = { public: '', private: '' };
    els.publicKey.value = '';
    els.privateKey.value = '';
    els.walletBalance.textContent = '0 MC';
    els.txFrom.value = '';
    els.txTo.value = '';
    els.txAmount.value = '';
    els.mineRewardAddress.value = '';
    els.validationResult.textContent = '';
    els.validationResult.className = 'status-indicator';
    els.historyResults.innerHTML = '<p class="dim">Enter an address above to view transaction history.</p>';

    fetchChain();
    fetchPending();
    fetchNetworkInfo();
    showToast('Blockchain reset to genesis state', 'info');
  } catch (e) {
    showToast('Reset failed', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════
// TRANSACTION HISTORY
// ═══════════════════════════════════════════════════════════════

async function searchHistory() {
  const address = els.historyAddress.value.trim();
  if (!address) {
    showToast('Enter an address to search', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/transactions/${address}`);
    const txs = await res.json();

    if (txs.length === 0) {
      els.historyResults.innerHTML = '<p class="dim">No transactions found for this address.</p>';
      return;
    }

    els.historyResults.innerHTML = txs.map(tx => {
      const counterparty = tx.type === 'sent'
        ? (tx.to.substring(0, 12) + '...')
        : (tx.from ? tx.from.substring(0, 12) + '...' : 'System');
      const sign = tx.type === 'sent' ? '-' : '+';
      const date = new Date(tx.timestamp).toLocaleString();

      return `
        <div class="history-item ${tx.type}">
          <div style="flex: 1">
            <div style="font-weight: 600">${tx.type === 'sent' ? '↗ Sent to' : '↙ Received from'} ${counterparty}</div>
            <div class="history-meta">Block #${tx.blockIndex} • ${date}</div>
          </div>
          <div class="history-amount ${tx.type}">${sign}${tx.amount} MC</div>
        </div>
      `;
    }).join('');
  } catch (e) {
    showToast('Error fetching transaction history', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════
// BLOCKCHAIN EXPLORER — Renders all blocks
// ═══════════════════════════════════════════════════════════════

async function fetchChain() {
  try {
    const res = await fetch(`${API_BASE}/chain`);
    const chain = await res.json();

    els.blockchainDisplay.innerHTML = '';

    chain.forEach((block) => {
      const date = new Date(block.timestamp).toLocaleString();

      // Build transaction HTML
      let txHtml = '';
      if (block.transactions.length === 0) {
        txHtml = '<div class="tx-item">No transactions (Genesis Block)</div>';
      } else {
        block.transactions.forEach(tx => {
          const from = tx.fromAddress
            ? tx.fromAddress.substring(0, 12) + '...'
            : 'System (Reward)';
          const to = tx.toAddress.substring(0, 12) + '...';
          txHtml += `<div class="tx-item">
            ${from} → ${to}: <strong>${tx.amount} MC</strong>
          </div>`;
        });
      }

      // Highlight tampered block if validation found one
      const isTampered = brokenBlockIndex !== null && block.index === brokenBlockIndex;
      const cardClass = isTampered ? 'block-card tampered' : 'block-card';

      const html = `
        <div class="${cardClass}" id="block-${block.index}">
          <div class="block-header">
            <span class="block-index">Block #${block.index}</span>
            <span class="block-time">${date}</span>
          </div>
          <div class="hash-row">
            <span class="hash-label">Hash:</span>
            <span class="hash-value">${block.hash}</span>
          </div>
          <div class="hash-row">
            <span class="hash-label">Prev Hash:</span>
            <span class="prev-hash-value">${block.previousHash}</span>
          </div>
          <div class="hash-row" style="color: #666; font-size: 0.78rem">
            Nonce: ${block.nonce}
          </div>
          <div class="tx-container">
            <div class="tx-header">Transactions (${block.transactions.length})</div>
            ${txHtml}
          </div>
        </div>
      `;

      els.blockchainDisplay.innerHTML += html;
    });

    // Update chain length in header
    els.chainLength.textContent = chain.length;

  } catch (e) {
    els.blockchainDisplay.innerHTML = '<div class="loader">Error loading chain</div>';
  }
}
