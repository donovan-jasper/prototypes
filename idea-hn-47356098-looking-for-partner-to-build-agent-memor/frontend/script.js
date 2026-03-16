const API_BASE_URL = 'http://localhost:3000/api';

// Helper to display messages
function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `status-message ${type}`;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// --- VSA Operations ---
document.getElementById('createVectorBtn').addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/vsa/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('vectorOutput').value = data.vector;
        } else {
            document.getElementById('vectorOutput').value = `Error: ${data.error}`;
        }
    } catch (error) {
        document.getElementById('vectorOutput').value = `Network Error: ${error.message}`;
    }
});

document.getElementById('bindVectorsBtn').addEventListener('click', async () => {
    const vec1 = document.getElementById('vec1Input').value;
    const vec2 = document.getElementById('vec2Input').value;
    try {
        const response = await fetch(`${API_BASE_URL}/vsa/bind`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vec1, vec2 }),
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('vsaResultOutput').value = `Bound Vector: ${data.boundVector}`;
        } else {
            document.getElementById('vsaResultOutput').value = `Error: ${data.error}`;
        }
    } catch (error) {
        document.getElementById('vsaResultOutput').value = `Network Error: ${error.message}`;
    }
});

document.getElementById('bundleVectorsBtn').addEventListener('click', async () => {
    const vectorsInput = document.getElementById('bundleVectorsInput').value;
    try {
        const vectors = JSON.parse(vectorsInput);
        if (!Array.isArray(vectors)) {
            document.getElementById('vsaResultOutput').value = 'Error: Input must be a JSON array of vector strings.';
            return;
        }
        const response = await fetch(`${API_BASE_URL}/vsa/bundle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vectors }),
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('vsaResultOutput').value = `Bundled Vector: ${data.bundledVector}`;
        } else {
            document.getElementById('vsaResultOutput').value = `Error: ${data.error}`;
        }
    } catch (error) {
        document.getElementById('vsaResultOutput').value = `Network Error or Invalid JSON: ${error.message}`;
    }
});

document.getElementById('similarityVectorsBtn').addEventListener('click', async () => {
    const vec1 = document.getElementById('vec1Input').value;
    const vec2 = document.getElementById('vec2Input').value;
    try {
        const response = await fetch(`${API_BASE_URL}/vsa/similarity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vec1, vec2 }),
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('vsaResultOutput').value = `Similarity: ${data.similarity.toFixed(4)}`;
        } else {
            document.getElementById('vsaResultOutput').value = `Error: ${data.error}`;
        }
    } catch (error) {
        document.getElementById('vsaResultOutput').value = `Network Error: ${error.message}`;
    }
});

// --- Graph Traversal Engine ---
document.getElementById('addNodeBtn').addEventListener('click', async () => {
    const name = document.getElementById('nodeNameInput').value;
    const vsaVector = document.getElementById('nodeVsaInput').value;
    if (!name) {
        showStatus('graphStatus', 'Node name cannot be empty.', 'error');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/graph/node`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, vsaVector: vsaVector || undefined }),
        });
        const data = await response.json();
        if (response.ok) {
            showStatus('graphStatus', `Node '${data.name}' added with ID: ${data.id}`, 'success');
            document.getElementById('nodeNameInput').value = '';
            document.getElementById('nodeVsaInput').value = '';
        } else {
            showStatus('graphStatus', `Error adding node: ${data.error}`, 'error');
        }
    } catch (error) {
        showStatus('graphStatus', `Network Error: ${error.message}`, 'error');
    }
});

document.getElementById('addEdgeBtn').addEventListener('click', async () => {
    const sourceName = document.getElementById('sourceNodeInput').value;
    const targetName = document.getElementById('targetNodeInput').value;
    if (!sourceName || !targetName) {
        showStatus('graphStatus', 'Source and target node names cannot be empty.', 'error');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/graph/edge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceName, targetName }),
        });
        const data = await response.json();
        if (response.ok) {
            showStatus('graphStatus', `Edge added from '${sourceName}' to '${targetName}'`, 'success');
            document.getElementById('sourceNodeInput').value = '';
            document.getElementById('targetNodeInput').value = '';
        } else {
            showStatus('graphStatus', `Error adding edge: ${data.error}`, 'error');
        }
    } catch (error) {
        showStatus('graphStatus', `Network Error: ${error.message}`, 'error');
    }
});

document.getElementById('traverseGraphBtn').addEventListener('click', async () => {
    const startNodeName = document.getElementById('startNodeInput').value;
    if (!startNodeName) {
        showStatus('graphStatus', 'Start node name cannot be empty.', 'error');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/graph/traverse/${startNodeName}`);
        const data = await response.json();
        if (response.ok) {
            document.getElementById('graphTraversalOutput').value = `Traversal Path: ${data.path.join(' -> ')}`;
        } else {
            document.getElementById('graphTraversalOutput').value = `Error: ${data.error}`;
        }
    } catch (error) {
        document.getElementById('graphTraversalOutput').value = `Network Error: ${error.message}`;
    }
});

// --- Agent Memory Management ---
document.getElementById('storeMemoryBtn').addEventListener('click', async () => {
    const description = document.getElementById('memoryDescriptionInput').value;
    if (!description) {
        showStatus('memoryStatus', 'Memory description cannot be empty.', 'error');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/memory/store`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description }),
        });
        const data = await response.json();
        if (response.ok) {
            showStatus('memoryStatus', `Memory stored: "${data.description}" (ID: ${data.id})`, 'success');
            document.getElementById('memoryDescriptionInput').value = '';
            await getAllMemories(); // Refresh all memories list
        } else {
            showStatus('memoryStatus', `Error storing memory: ${data.error}`, 'error');
        }
    } catch (error) {
        showStatus('memoryStatus', `Network Error: ${error.message}`, 'error');
    }
});

document.getElementById('retrieveMemoryBtn').addEventListener('click', async () => {
    const query = document.getElementById('memoryQueryInput').value;
    const threshold = parseFloat(document.getElementById('memoryThresholdInput').value);
    if (!query) {
        showStatus('memoryStatus', 'Query cannot be empty.', 'error');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/memory/retrieve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, threshold }),
        });
        const data = await response.json();
        if (response.ok) {
            if (data.memories.length > 0) {
                const output = data.memories.map(m => `ID: ${m.id}, Desc: "${m.description}", Sim: ${m.similarity.toFixed(4)}`).join('\n');
                document.getElementById('memoryOutput').value = `Retrieved Memories:\n${output}`;
                showStatus('memoryStatus', `Found ${data.memories.length} similar memories.`, 'success');
            } else {
                document.getElementById('memoryOutput').value = 'No similar memories found.';
                showStatus('memoryStatus', 'No similar memories found.', 'info');
            }
        } else {
            showStatus('memoryStatus', `Error retrieving memories: ${data.error}`, 'error');
        }
    } catch (error) {
        showStatus('memoryStatus', `Network Error: ${error.message}`, 'error');
    }
});

async function getAllMemories() {
    try {
        const response = await fetch(`${API_BASE_URL}/memory/all`);
        const data = await response.json();
        if (response.ok) {
            if (data.memories.length > 0) {
                const output = data.memories.map(m => `ID: ${m.id}, Desc: "${m.description}", Node: ${m.node_name}, VSA: ${m.vsa_vector.substring(0, 30)}...`).join('\n');
                document.getElementById('memoryOutput').value = `All Stored Memories:\n${output}`;
            } else {
                document.getElementById('memoryOutput').value = 'No memories stored yet.';
            }
        } else {
            document.getElementById('memoryOutput').value = `Error fetching all memories: ${data.error}`;
        }
    } catch (error) {
        document.getElementById('memoryOutput').value = `Network Error: ${error.message}`;
    }
}

document.getElementById('getAllMemoriesBtn').addEventListener('click', getAllMemories);

// Initial load of all memories
document.addEventListener('DOMContentLoaded', getAllMemories);
