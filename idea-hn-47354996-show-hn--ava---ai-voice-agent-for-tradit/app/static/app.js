async function fetchHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        const statusEl = document.getElementById('status');
        statusEl.textContent = `${data.status.toUpperCase()} | Active Calls: ${data.active_calls}`;
        statusEl.className = `status ${data.asterisk_connected ? 'healthy' : 'error'}`;
    } catch (error) {
        console.error('Health check failed:', error);
        const statusEl = document.getElementById('status');
        statusEl.textContent = `ERROR | Asterisk Disconnected`;
        statusEl.className = `status error`;
    }
}

async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        document.getElementById('systemPrompt').value = config.system_prompt;
        document.getElementById('sttProvider').textContent = config.stt_provider;
        document.getElementById('llmProvider').textContent = config.llm_provider;
        document.getElementById('llmModel').textContent = config.llm_model;
        document.getElementById('ttsProvider').textContent = config.tts_provider;
    } catch (error) {
        console.error('Failed to load config:', error);
    }
}

async function saveConfig() {
    const systemPrompt = document.getElementById('systemPrompt').value;
    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ system_prompt: systemPrompt })
        });
        if (response.ok) {
            alert('Configuration saved successfully!');
            loadConfig(); // Reload config to show updated values if any
        } else {
            alert('Failed to save configuration.');
        }
    } catch (error) {
        console.error('Failed to save config:', error);
        alert('Failed to save configuration');
    }
}

async function fetchCalls() {
    try {
        const response = await fetch('/api/calls');
        const calls = await response.json();
        const callsTableBody = document.getElementById('callsTable').querySelector('tbody');
        callsTableBody.innerHTML = ''; // Clear existing rows

        calls.forEach(call => {
            const row = callsTableBody.insertRow();
            row.insertCell().textContent = call.call_id.substring(0, 8) + '...'; // Shorten for display
            row.insertCell().textContent = call.caller_number;
            row.insertCell().textContent = new Date(call.start_time).toLocaleString();
            row.insertCell().textContent = call.duration ? `${call.duration.toFixed(1)}s` : 'N/A';
            const statusCell = row.insertCell();
            statusCell.innerHTML = `<span class="status-badge ${call.status}">${call.status.toUpperCase()}</span>`;
            const transcriptCell = row.insertCell();
            transcriptCell.textContent = call.transcript ? call.transcript.substring(0, 100) + (call.transcript.length > 100 ? '...' : '') : 'N/A';
        });
    } catch (error) {
        console.error('Failed to fetch calls:', error);
    }
}

function init() {
    fetchHealth();
    loadConfig();
    fetchCalls();

    // Refresh data periodically
    setInterval(fetchHealth, 5000);
    setInterval(fetchCalls, 10000);
}

document.addEventListener('DOMContentLoaded', init);
