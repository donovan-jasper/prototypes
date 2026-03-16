document.addEventListener('DOMContentLoaded', () => {
    const adminTokenInput = document.getElementById('adminToken');
    const setAdminTokenBtn = document.getElementById('setAdminToken');
    const messageDiv = document.getElementById('message');

    let currentAdminToken = localStorage.getItem('adminToken') || '';
    if (currentAdminToken) {
        adminTokenInput.value = currentAdminToken;
        showMessage('Admin token loaded from local storage.', 'success');
        fetchData();
    } else {
        showMessage('Please enter your Admin Token to manage SecretSwap.', 'error');
    }

    setAdminTokenBtn.addEventListener('click', () => {
        currentAdminToken = adminTokenInput.value;
        if (currentAdminToken) {
            localStorage.setItem('adminToken', currentAdminToken);
            showMessage('Admin Token set successfully!', 'success');
            fetchData();
        } else {
            showMessage('Admin Token cannot be empty.', 'error');
        }
    });

    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    async function fetchData() {
        if (!currentAdminToken) {
            return;
        }
        await fetchSecrets();
        await fetchAgents();
        await fetchLogs();
    }

    // --- Secrets Management ---
    const secretForm = document.getElementById('secretForm');
    const secretsTableBody = document.getElementById('secretsTableBody');
    const secretModal = document.getElementById('secretModal');
    const closeSecretModal = document.querySelector('#secretModal .close-button');
    const modalSecretId = document.getElementById('modalSecretId');
    const modalSecretName = document.getElementById('modalSecretName');
    const modalPlaceholderKey = document.getElementById('modalPlaceholderKey');
    const modalCredential = document.getElementById('modalCredential');
    const modalServiceType = document.getElementById('modalServiceType');
    const saveSecretBtn = document.getElementById('saveSecretBtn');
    const addSecretBtn = document.getElementById('addSecretBtn');

    addSecretBtn.addEventListener('click', () => openSecretModal());
    closeSecretModal.addEventListener('click', () => secretModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target == secretModal) {
            secretModal.style.display = 'none';
        }
    });

    function openSecretModal(secret = {}) {
        modalSecretId.value = secret.id || '';
        modalSecretName.value = secret.name || '';
        modalPlaceholderKey.value = secret.placeholder_key || '';
        modalCredential.value = secret.credential === '********' ? '' : secret.credential || ''; // Don't pre-fill masked credential
        modalServiceType.value = secret.service_type || '';
        secretModal.style.display = 'block';
    }

    saveSecretBtn.addEventListener('click', async () => {
        const id = modalSecretId.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/secrets/${id}` : '/api/secrets';

        const data = {
            name: modalSecretName.value,
            placeholder_key: modalPlaceholderKey.value,
            credential: modalCredential.value,
            service_type: modalServiceType.value
        };

        if (!data.name || !data.placeholder_key || !data.credential || !data.service_type) {
            showMessage('All secret fields are required.', 'error');
            return;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Token': currentAdminToken
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                showMessage(`Secret ${id ? 'updated' : 'created'} successfully!`, 'success');
                secretModal.style.display = 'none';
                fetchSecrets();
            } else {
                showMessage(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            showMessage(`Network error: ${error.message}`, 'error');
        }
    });

    async function fetchSecrets() {
        if (!currentAdminToken) return;
        try {
            const response = await fetch('/api/secrets', {
                headers: { 'X-Admin-Token': currentAdminToken }
            });
            const secrets = await response.json();
            if (!response.ok) {
                showMessage(`Error fetching secrets: ${secrets.error}`, 'error');
                secretsTableBody.innerHTML = '<tr><td colspan="6">Error loading secrets. Check Admin Token.</td></tr>';
                return;
            }
            secretsTableBody.innerHTML = '';
            secrets.forEach(secret => {
                const row = secretsTableBody.insertRow();
                row.insertCell(0).textContent = secret.id;
                row.insertCell(1).textContent = secret.name;
                row.insertCell(2).innerHTML = `<code>{{${secret.placeholder_key}}}</code> <button class="btn btn-copy" data-copy="{{${secret.placeholder_key}}}">Copy</button>`;
                row.insertCell(3).textContent = secret.service_type;
                row.insertCell(4).textContent = new Date(secret.created_at).toLocaleString();
                const actionsCell = row.insertCell(5);
                actionsCell.className = 'table-actions';
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edit';
                editBtn.className = 'btn btn-secondary btn-sm';
                editBtn.addEventListener('click', () => openSecretModal(secret));
                actionsCell.appendChild(editBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.className = 'btn btn-danger btn-sm';
                deleteBtn.addEventListener('click', () => deleteSecret(secret.id));
                actionsCell.appendChild(deleteBtn);
            });
            attachCopyListeners();
        } catch (error) {
            showMessage(`Network error fetching secrets: ${error.message}`, 'error');
            secretsTableBody.innerHTML = '<tr><td colspan="6">Network error loading secrets.</td></tr>';
        }
    }

    async function deleteSecret(id) {
        if (!confirm('Are you sure you want to delete this secret?')) return;
        try {
            const response = await fetch(`/api/secrets/${id}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Token': currentAdminToken }
            });
            const result = await response.json();
            if (response.ok) {
                showMessage('Secret deleted successfully!', 'success');
                fetchSecrets();
            } else {
                showMessage(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            showMessage(`Network error: ${error.message}`, 'error');
        }
    }

    // --- Agent Management ---
    const agentForm = document.getElementById('agentForm');
    const agentsTableBody = document.getElementById('agentsTableBody');

    agentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const agentName = document.getElementById('agentName').value;
        if (!agentName) {
            showMessage('Agent name cannot be empty.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/agents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Token': currentAdminToken
                },
                body: JSON.stringify({ name: agentName })
            });
            const result = await response.json();
            if (response.ok) {
                showMessage(`Agent '${result.name}' created with token: ${result.token}`, 'success');
                document.getElementById('agentName').value = '';
                fetchAgents();
            } else {
                showMessage(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            showMessage(`Network error: ${error.message}`, 'error');
        }
    });

    async function fetchAgents() {
        if (!currentAdminToken) return;
        try {
            const response = await fetch('/api/agents', {
                headers: { 'X-Admin-Token': currentAdminToken }
            });
            const agents = await response.json();
            if (!response.ok) {
                showMessage(`Error fetching agents: ${agents.error}`, 'error');
                agentsTableBody.innerHTML = '<tr><td colspan="4">Error loading agents. Check Admin Token.</td></tr>';
                return;
            }
            agentsTableBody.innerHTML = '';
            agents.forEach(agent => {
                const row = agentsTableBody.insertRow();
                row.insertCell(0).textContent = agent.id;
                row.insertCell(1).textContent = agent.name;
                row.insertCell(2).innerHTML = `<code>${agent.token}</code> <button class="btn btn-copy" data-copy="${agent.token}">Copy</button>`;
                row.insertCell(3).textContent = new Date(agent.created_at).toLocaleString();
            });
            attachCopyListeners();
        } catch (error) {
            showMessage(`Network error fetching agents: ${error.message}`, 'error');
            agentsTableBody.innerHTML = '<tr><td colspan="4">Network error loading agents.</td></tr>';
        }
    }

    // --- Audit Logs ---
    const logsTableBody = document.getElementById('logsTableBody');

    async function fetchLogs() {
        if (!currentAdminToken) return;
        try {
            const response = await fetch('/api/logs', {
                headers: { 'X-Admin-Token': currentAdminToken }
            });
            const logs = await response.json();
            if (!response.ok) {
                showMessage(`Error fetching logs: ${logs.error}`, 'error');
                logsTableBody.innerHTML = '<tr><td colspan="5">Error loading logs. Check Admin Token.</td></tr>';
                return;
            }
            logsTableBody.innerHTML = '';
            logs.forEach(log => {
                const row = logsTableBody.insertRow();
                row.insertCell(0).textContent = new Date(log.timestamp).toLocaleString();
                row.insertCell(1).textContent = log.agent_name || 'N/A';
                row.insertCell(2).textContent = log.target_api;
                const statusCell = row.insertCell(3);
                statusCell.textContent = log.success ? 'Success' : 'Failure';
                statusCell.className = log.success ? 'log-success' : 'log-failure';
                const messageCell = row.insertCell(4);
                messageCell.innerHTML = log.message ? `<code class="log-message">${log.message}</code>` : '';
            });
        } catch (error) {
            showMessage(`Network error fetching logs: ${error.message}`, 'error');
            logsTableBody.innerHTML = '<tr><td colspan="5">Network error loading logs.</td></tr>';
        }
    }

    // --- Utility: Copy to Clipboard ---
    function attachCopyListeners() {
        document.querySelectorAll('.btn-copy').forEach(button => {
            button.onclick = async () => {
                const textToCopy = button.dataset.copy;
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = 'Copy';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy: ', err);
                    alert('Failed to copy. Please copy manually: ' + textToCopy);
                }
            };
        });
    }

    // Initial fetch if admin token is already set
    if (currentAdminToken) {
        fetchData();
    }
});
