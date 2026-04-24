const express = require('express');
const cors = require('cors');
const path = require('path');
const Blockchain = require('./models/Blockchain');
const apiRoutes = require('./routes/api');

const app = express();
const port = 3000;

// Initialize Blockchain
const minicoin = new Blockchain();

// Middleware
app.use(cors());
app.use(express.json());

// Main UI Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api', apiRoutes(minicoin));

app.listen(port, () => {
  console.log(`MiniCoin node running on http://localhost:${port}`);
});
