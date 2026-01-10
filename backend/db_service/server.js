require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json({ limit: '50mb' })); // Large limit for blockchain data

// MongoDB Connection
// MongoDB Connection
// Try to connect to Atlas/Local Mongo. If fails, fallback to In-Memory.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crudochain';

// In-memory storage (Fallback)
let blockchain = [];
let orderbook = { buys: [], sells: [] };
let tokens = [];
let games = [];
let library = {};
let users = [];

let isInMemory = false;

const connectDB = async () => {
    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 30000 });
        console.log('✅ Connected to MongoDB');
        isInMemory = false;
    } catch (err) {
        console.error('❌ MongoDB Connection Failed:', err.message);
        console.log('⚠️ Switching to IN-MEMORY mode. Data will be lost on restart.');
        isInMemory = true;
    }
};

connectDB();

// Routes
app.get('/', (req, res) => {
    res.send('🚀 CrudoChain DB Service is Running (In-Memory Mode)');
});

// --- Blockchain ---
app.post('/chain/save', (req, res) => {
    try {
        const chain = req.body;
        if (!Array.isArray(chain)) return res.status(400).send('Invalid chain format');
        blockchain = chain;
        console.log(`Saved ${chain.length} blocks to Memory.`);
        res.json({ status: 'success', count: chain.length });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/chain/load', (req, res) => {
    res.json(blockchain);
});

// --- OrderBook ---
app.post('/orderbook/save', (req, res) => {
    try {
        const { buys, sells } = req.body;
        orderbook = { buys, sells };
        console.log(`Saved ${buys.length + sells.length} orders to Memory.`);
        res.json({ status: 'success', count: buys.length + sells.length });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/orderbook/load', (req, res) => {
    res.json(orderbook);
});

// --- Tokens (CrudoLauncher) ---
app.post('/tokens/save', (req, res) => {
    try {
        const newTokens = req.body;
        tokens = newTokens;
        console.log(`Saved ${tokens.length} tokens to Memory.`);
        res.json({ status: 'success', count: tokens.length });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/tokens/load', (req, res) => {
    res.json(tokens);
});

// --- Games ---
app.post('/games/save', (req, res) => {
    try {
        games = req.body;
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/games/load', (req, res) => {
    res.json(games);
});

// --- Library ---
app.post('/games/library/save', (req, res) => {
    try {
        library = req.body;
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/games/library/load', (req, res) => {
    res.json(library);
});

// --- Users ---
// users array is already declared at the top

app.post('/users/save', (req, res) => {
    try {
        const user = req.body;
        const index = users.findIndex(u => u.email === user.email);
        if (index !== -1) {
            users[index] = { ...users[index], ...user };
        } else {
            users.push(user);
        }
        res.json({ status: 'success', user });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/users/find', (req, res) => {
    try {
        const { email, userId } = req.query;
        let user;
        if (email) {
            user = users.find(u => u.email === email);
        } else if (userId) {
            user = users.find(u => u._id === userId || u.id === userId);
        }
        res.json(user || null);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 DB Service running on http://localhost:${PORT} (IN-MEMORY MODE)`);
});
