const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { createVector, stringToVector, vectorToString, similarity } = require('./vsa-impl');

const DB_PATH = path.join(__dirname, '../database/vector_mind.db');

class GraphTraversalEngine {
    constructor() {
        this.db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to the SQLite database for graph operations.');
            }
        });
    }

    /**
     * Adds a new node to the graph.
     * If a VSA vector is not provided, a new random one is generated.
     * @param {string} name - The unique name of the node.
     * @param {string} [vsaVectorStr] - Optional string representation of the VSA vector.
     * @param {string} [type='concept'] - The type of the node (e.g., 'concept', 'memory').
     * @returns {Promise<object>} - The created node object { id, name, vsa_vector, type }.
     */
    async addNode(name, vsaVectorStr = null, type = 'concept') {
        return new Promise((resolve, reject) => {
            const vector = vsaVectorStr ? stringToVector(vsaVectorStr) : createVector();
            const vectorStr = vectorToString(vector);

            this.db.run(
                'INSERT INTO nodes (name, vsa_vector, type) VALUES (?, ?, ?)',
                [name, vectorStr, type],
                function (err) {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed: nodes.name')) {
                            reject(new Error(`Node with name '${name}' already exists.`));
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve({ id: this.lastID, name, vsa_vector: vectorStr, type });
                    }
                }
            );
        });
    }

    /**
     * Retrieves a node by its name.
     * @param {string} name - The name of the node.
     * @returns {Promise<object|null>} - The node object or null if not found.
     */
    async getNodeByName(name) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM nodes WHERE name = ?', [name], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Retrieves a node by its ID.
     * @param {number} id - The ID of the node.
     * @returns {Promise<object|null>} - The node object or null if not found.
     */
    async getNodeById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM nodes WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Adds an edge between two nodes.
     * @param {string} sourceName - The name of the source node.
     * @param {string} targetName - The name of the target node.
     * @param {number} [weight=1.0] - The weight of the edge.
     * @returns {Promise<object>} - The created edge object { id, source_node_id, target_node_id, weight }.
     */
    async addEdge(sourceName, targetName, weight = 1.0) {
        return new Promise(async (resolve, reject) => {
            try {
                const sourceNode = await this.getNodeByName(sourceName);
                const targetNode = await this.getNodeByName(targetName);

                if (!sourceNode) {
                    throw new Error(`Source node '${sourceName}' not found.`);
                }
                if (!targetNode) {
                    throw new Error(`Target node '${targetName}' not found.`);
                }

                this.db.run(
                    'INSERT INTO edges (source_node_id, target_node_id, weight) VALUES (?, ?, ?)',
                    [sourceNode.id, targetNode.id, weight],
                    function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ id: this.lastID, source_node_id: sourceNode.id, target_node_id: targetNode.id, weight });
                        }
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Performs a Breadth-First Search (BFS) traversal starting from a given node.
     * This prototype uses standard BFS, but conceptually, VSA vectors could be used
     * for more advanced similarity-based traversals or path encoding.
     * @param {string} startNodeName - The name of the starting node.
     * @returns {Promise<string[]>} - An array of node names in the traversal order.
     */
    async traverseBFS(startNodeName) {
        return new Promise(async (resolve, reject) => {
            try {
                const startNode = await this.getNodeByName(startNodeName);
                if (!startNode) {
                    throw new Error(`Start node '${startNodeName}' not found.`);
                }

                const queue = [startNode.id];
                const visited = new Set();
                const path = [];

                visited.add(startNode.id);
                path.push(startNode.name);

                while (queue.length > 0) {
                    const currentNodeId = queue.shift();

                    const neighbors = await new Promise((res, rej) => {
                        this.db.all(
                            `SELECT n.id, n.name FROM edges e JOIN nodes n ON e.target_node_id = n.id WHERE e.source_node_id = ?`,
                            [currentNodeId],
                            (err, rows) => {
                                if (err) rej(err);
                                else res(rows);
                            }
                        );
                    });

                    for (const neighbor of neighbors) {
                        if (!visited.has(neighbor.id)) {
                            visited.add(neighbor.id);
                            queue.push(neighbor.id);
                            path.push(neighbor.name);
                        }
                    }
                }
                resolve(path);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Finds nodes whose VSA vectors are similar to a given query vector.
     * @param {string} queryVectorStr - The string representation of the query VSA vector.
     * @param {number} [threshold=0.7] - The similarity threshold.
     * @param {string} [nodeType='concept'] - Filter by node type.
     * @returns {Promise<object[]>} - An array of similar nodes with their similarity scores.
     */
    async findSimilarNodes(queryVectorStr, threshold = 0.7, nodeType = 'concept') {
        return new Promise(async (resolve, reject) => {
            try {
                const queryVector = stringToVector(queryVectorStr);
                if (!queryVector) {
                    throw new Error("Invalid query VSA vector string.");
                }

                const allNodes = await new Promise((res, rej) => {
                    this.db.all('SELECT id, name, vsa_vector, type FROM nodes WHERE type = ?', [nodeType], (err, rows) => {
                        if (err) rej(err);
                        else res(rows);
                    });
                });

                const similarNodes = [];
                for (const node of allNodes) {
                    const nodeVector = stringToVector(node.vsa_vector);
                    if (nodeVector) {
                        const sim = similarity(queryVector, nodeVector);
                        if (sim >= threshold) {
                            similarNodes.push({ ...node, similarity: sim });
                        }
                    }
                }
                // Sort by similarity in descending order
                similarNodes.sort((a, b) => b.similarity - a.similarity);
                resolve(similarNodes);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new GraphTraversalEngine();
