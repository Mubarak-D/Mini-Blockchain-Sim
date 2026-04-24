const API_BASE = '/api';

// UI Elements
const els = {
    generateWalletBtn: document.getElementById('generateWalletBtn'),
    publicKey: document.getElementById('publicKey'),
    privateKey: document.getElementById('privateKey'),
    walletBalance: document.getElementById('walletBalance'),
    
    txFrom: document.getElementById('txFrom'),
    txTo: document.getElementById('txTo'),
    txAmount: document.getElementById('txAmount'),
    sendTxBtn: document.getElementById('sendTxBtn'),
    
    pendingCount: document.getElementById('pendingCount'),
    mineRewardAddress: document.getElementById('mineRewardAddress'),
    mineBtn: document.getElementById('mineBtn'),
    
    validateBtn: document.getElementById('validateBtn'),
    tamperBtn: document.getElementById('tamperBtn'),
    validationResult: document.getElementById('validationResult'),
    
    blockchainDisplay: document.getElementById('blockchainDisplay')
};

// State
let wallet = { public: '', private: '' };

// Event Listeners
els.generateWalletBtn.addEventListener('click', generateWallet);
els.sendTxBtn.addEventListener('click', sendTransaction);
els.mineBtn.addEventListener('click', mineBlock);
els.validateBtn.addEventListener('click', validateChain);
els.tamperBtn.addEventListener('click', tamperBlock);

// Fetch initial data
fetchChain();
fetchPending();

// Functions
async function generateWallet() {
    try {
        const res = await fetch(`${API_BASE}/wallet`, { method: 'POST' });
        const data = await res.json();
        
        wallet.public = data.publicKey;
        wallet.private = data.privateKey;
        
        els.publicKey.value = data.publicKey;
        els.privateKey.value = data.privateKey;
        
        // Auto-fill forms
        els.txFrom.value = data.publicKey;
        els.mineRewardAddress.value = data.publicKey;
        
        await updateBalance(data.publicKey);
    } catch (e) {
        console.error('Error generating wallet', e);
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

async function sendTransaction() {
    const tx = {
        fromAddress: els.txFrom.value,
        toAddress: els.txTo.value,
        amount: els.txAmount.value
    };
    
    if (!tx.fromAddress || !tx.toAddress || !tx.amount) {
        alert('Please fill out all transaction fields');
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
        
        alert('Transaction added to mempool!');
        els.txTo.value = '';
        els.txAmount.value = '';
        fetchPending();
    } catch (e) {
        alert(e.message);
    }
}

async function fetchPending() {
    try {
        const res = await fetch(`${API_BASE}/pending`);
        const pending = await res.json();
        els.pendingCount.textContent = pending.length;
    } catch (e) {
        console.error(e);
    }
}

async function mineBlock() {
    const rewardAddress = els.mineRewardAddress.value;
    if (!rewardAddress) {
        alert('Please specify a reward address');
        return;
    }
    
    const originalText = els.mineBtn.textContent;
    els.mineBtn.textContent = 'Mining...';
    els.mineBtn.disabled = true;
    
    try {
        const res = await fetch(`${API_BASE}/mine`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rewardAddress })
        });
        
        await res.json();
        
        fetchChain();
        fetchPending();
        if (wallet.public) updateBalance(wallet.public);
        
        els.validationResult.textContent = '';
        els.validationResult.className = 'status-indicator';
    } catch (e) {
        console.error(e);
    } finally {
        els.mineBtn.textContent = originalText;
        els.mineBtn.disabled = false;
    }
}

async function validateChain() {
    try {
        const res = await fetch(`${API_BASE}/validate`);
        const data = await res.json();
        
        if (data.isValid) {
            els.validationResult.textContent = 'Chain is VALID ✓';
            els.validationResult.className = 'status-indicator status-valid';
        } else {
            els.validationResult.textContent = 'Chain is INVALID ✗';
            els.validationResult.className = 'status-indicator status-invalid';
            
            // Optionally fetch chain again to highlight tampered block visually
            fetchChain(true); 
        }
    } catch (e) {
        console.error(e);
    }
}

async function tamperBlock() {
    try {
        await fetch(`${API_BASE}/tamper`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blockIndex: 1 }) // Tamper with block 1
        });
        
        alert('Block 1 tampered with malicious transaction!');
        fetchChain(); // Update view
    } catch (e) {
        console.error(e);
    }
}

async function fetchChain(highlightInvalid = false) {
    try {
        const res = await fetch(`${API_BASE}/chain`);
        const chain = await res.json();
        
        els.blockchainDisplay.innerHTML = '';
        
        chain.forEach((block, i) => {
            const date = new Date(block.timestamp).toLocaleString();
            
            let txHtml = '';
            if (block.transactions.length === 0) {
                txHtml = '<div class="tx-item">No transactions (Genesis Block)</div>';
            } else {
                block.transactions.forEach(tx => {
                    const fromShort = tx.fromAddress ? tx.fromAddress.substring(0, 10) + '...' : 'System (Reward)';
                    const toShort = tx.toAddress.substring(0, 10) + '...';
                    txHtml += `<div class="tx-item">
                        [${fromShort}] → [${toShort}]: <strong>${tx.amount} MC</strong>
                    </div>`;
                });
            }
            
            // Just visual highlight if requested, checking locally
            let cardClass = 'block-card';
            
            const html = `
                <div class="${cardClass}">
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
                    <div class="hash-row" style="color: #888; font-size: 0.8rem">
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
        
    } catch (e) {
        els.blockchainDisplay.innerHTML = '<div class="loader">Error loading chain</div>';
    }
}
