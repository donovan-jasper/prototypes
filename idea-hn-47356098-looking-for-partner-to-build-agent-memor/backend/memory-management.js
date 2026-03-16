const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const graphTraversal = require('./graph-traversal');
const { createVector, stringToVector, vectorToString, similarity } = require('./vsa-impl');

const DB_PATH = path.join(__dirname, '../database/vector_mind.db');

class MemoryManagementSystem {
    constructor() {
        this.db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database for memory management:', err.message);
            } else {
                console.log('Connected to the SQLite database for memory operations.');
            }
        });
    }

    /**
     * Stores an agent memory. This creates a new node in the graph of type 'memory'
     * with a VSA vector representing the memory's content.
     * @param {string} description - A textual description of the memory.
     * @returns {Promise<object>} - The stored memory object { id, node_id, description, timestamp }.
     */
    async storeMemory(description) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a VSA vector for the memory description (simplified: just a random vector for now)
                // In a real system, this would be derived from the description text.
                const memoryVector = createVector();
                const memoryVectorStr = vectorToString(memoryVector);

                // Add this memory as a node in the graph
                const nodeName = `memory_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                const node = await graphTraversal.addNode(nodeName, memoryVectorStr, 'memory');

                // Store the memory details linking to the node
                this.db.run(
                    'INSERT INTO memories (node_id, description) VALUES (?, ?)',
                    [node.id, description],
                    function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ id: this.lastID, node_id: node.id, description, timestamp: new Date().toISOString() });
                        }
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves agent memories based on a query.
     * This involves generating a VSA vector for the query and finding similar memory nodes.
     * @param {string} query - The query string to search for memories.
     * @param {number} [threshold=0.7] - The similarity threshold for retrieval.
     * @returns {Promise<object[]>} - An array of retrieved memory objects with similarity scores.
     */
    async retrieveMemories(query, threshold = 0.7) {
        return new Promise(async (resolve, reject) => {
            try {
                // Generate a VSA vector for the query (simplified: just a random vector for now)
                // In a real system, this would be derived from the query text.
                const queryVector = createVector();
                const queryVectorStr = vectorToString(queryVector);

                // Find similar nodes of type 'memory'
                const similarMemoryNodes = await graphTraversal.findSimilarNodes(queryVectorStr, threshold, 'memory');

                // Fetch full memory details for the similar nodes
                const retrievedMemories = [];
                for (const node of similarMemoryNodes) {
                    const memory = await new Promise((res, rej) => {
                        this.db.get('SELECT * FROM memories WHERE node_id = ?', [node.id], (err, row) => {
                            if (err) rej(err);
                            else res(row);
                        });
                    });
                    if (memory) {
                        retrievedMemories.push({ ...memory, similarity: node.similarity });
                    }
                }
                resolve(retrievedMemories);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Gets all stored memories.
     * @returns {Promise<object[]>} - An array of all memory objects.
     */
    async getAllMemories() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT m.id, m.description, m.timestamp, n.name AS node_name, n.vsa_vector
                FROM memories m
                JOIN nodes n ON m.node_id = n.id
                ORDER BY m.timestamp DESC
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = new MemoryManagementSystem();
