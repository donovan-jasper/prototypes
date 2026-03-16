const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import cors

const vsa = require('./vsa-impl');
const graphTraversal = require('./graph-traversal');
const memoryManagement = require('./memory-management');

const app = express();
const PORT = 3000;

// Database setup
const DB_PATH = path.join(__dirname, '../database/vector_mind.db');
const SCHEMA_PATH = path.join(__dirname, '../database/schema.sql');

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Initialize database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            // Check if tables exist, if not, run schema
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='nodes'", (err, row) => {
                if (err) {
                    console.error("Error checking for tables:", err.message);
                    return;
                }
                if (!row) {
                    console.log('Database tables not found, running schema.sql...');
                    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
                    db.exec(schema, (err) => {
                        if (err) {
                            console.error('Error running schema.sql:', err.message);
                        } else {
                            console.log('Schema.sql executed successfully.');
                        }
                    });
                } else {
                    console.log('Database tables already exist.');
                }
            });
        });
    }
});

// --- VSA API Endpoints ---
app.post('/api/vsa/create', (req, res) => {
    try {
        const vector = vsa.createVector();
        res.json({ vector: vsa.vectorToString(vector) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/vsa/bind', (req, res) => {
    try {
        const { vec1, vec2 } = req.body;
        if (!vec1 || !vec2) {
            return res.status(400).json({ error: 'Both vec1 and vec2 are required.' });
        }
        const boundVector = vsa.bind(vsa.stringToVector(vec1), vsa.stringToVector(vec2));
        res.json({ boundVector: vsa.vectorToString(boundVector) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/vsa/bundle', (req, res) => {
    try {
        const { vectors } = req.body;
        if (!Array.isArray(vectors) || vectors.length < 1) {
            return res.status(400).json({ error: 'An array of at least one vector is required.' });
        }
        const hdVectors = vectors.map(vsa.stringToVector);
        const bundledVector = vsa.bundle(hdVectors);
        res.json({ bundledVector: vsa.vectorToString(bundledVector) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/vsa/similarity', (req, res) => {
    try {
        const { vec1, vec2 } = req.body;
        if (!vec1 || !vec2) {
            return res.status(400).json({ error: 'Both vec1 and vec2 are required.' });
        }
        const sim = vsa.similarity(vsa.stringToVector(vec1), vsa.stringToVector(vec2));
        res.json({ similarity: sim });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Graph API Endpoints ---
app.post('/api/graph/node', async (req, res) => {
    try {
        const { name, vsaVector, type } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Node name is required.' });
        }
        const node = await graphTraversal.addNode(name, vsaVector, type);
        res.status(201).json(node);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/graph/edge', async (req, res) => {
    try {
        const { sourceName, targetName, weight } = req.body;
        if (!sourceName || !targetName) {
            return res.status(400).json({ error: 'Source and target node names are required.' });
        }
        const edge = await graphTraversal.addEdge(sourceName, targetName, weight);
        res.status(201).json(edge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/graph/node/:name', async (req, res) => {
    try {
        const node = await graphTraversal.getNodeByName(req.params.name);
        if (!node) {
            return res.status(404).json({ error: 'Node not found.' });
        }
        res.json(node);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/graph/traverse/:startNodeName', async (req, res) => {
    try {
        const path = await graphTraversal.traverseBFS(req.params.startNodeName);
        res.json({ path });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Memory Management API Endpoints ---
app.post('/api/memory/store', async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ error: 'Memory description is required.' });
        }
        const memory = await memoryManagement.storeMemory(description);
        res.status(201).json(memory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/memory/retrieve', async (req, res) => {
    try {
        const { query, threshold } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query string is required.' });
        }
        const memories = await memoryManagement.retrieveMemories(query, threshold);
        res.json({ memories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/memory/all', async (req, res) => {
    try {
        const memories = await memoryManagement.getAllMemories();
        res.json({ memories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`VectorMind backend listening on port ${PORT}`);
});
