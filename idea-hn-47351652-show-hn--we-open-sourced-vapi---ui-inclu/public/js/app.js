import { api } from './api.js';
import { initCanvas, loadWorkflow, getWorkflowData, addNodeFromPalette, updateNodeConfig, deleteNode, resetView } from './canvas.js';
import { initVoiceTest, populateWorkflowSelect } from './voice.js';
import { nodeTypes } from './nodes.js';

// UI Elements
const workflowList = document.getElementById('workflow-list');
const newWorkflowBtn = document.getElementById('new-workflow-btn');
const saveWorkflowBtn = document.getElementById('save-workflow-btn');
const settingsBtn = document.getElementById('settings-btn');
const workflowModal = document.getElementById('workflow-modal');
const createWorkflowSubmit = document.getElementById('create-workflow-submit');
const workflowNameInput = document.getElementById('workflow-name');
const nodeConfigModal = document.getElementById('node-config-modal');
const nodeConfigTitle = document.getElementById('node-config-title');
const nodeConfigForm = document.getElementById('node-config-form');
const saveNodeConfigBtn = document.getElementById('save-node-config-btn');
const providerConfigModal = document.getElementById('provider-config-modal');
const openaiApiKeyInput = document.getElementById('openai-api-key');
const anthropicApiKeyInput = document.getElementById('anthropic-api-key');
const saveProviderBtns = document.querySelectorAll('.save-provider-btn');
const providerStatusDiv = document.getElementById('provider-status');
const workflowCanvas = document.getElementById('workflow-canvas');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const resetViewBtn = document.getElementById('reset-view-btn');

let currentWorkflow = null;
let activeNodeForConfig = null; // Node currently being configured

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    initCanvas(workflowCanvas, handleWorkflowUpdate, handleNodeClick);
    initVoiceTest();
    await loadWorkflows();
    setupEventListeners();
});

function setupEventListeners() {
    newWorkflowBtn.addEventListener('click', () => openModal(workflowModal));
    createWorkflowSubmit.addEventListener('click', handleCreateWorkflow);
    saveWorkflowBtn.addEventListener('click', handleSaveWorkflow);
    settingsBtn.addEventListener('click', openProviderConfigModal);

    // Close buttons for modals
    document.querySelectorAll('.modal .close-button').forEach(button => {
        button.addEventListener('click', (e) => closeModal(e.target.closest('.modal')));
    });
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    // Node palette drag-and-drop
    document.querySelectorAll('.node-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.nodeType);
            e.dataTransfer.effectAllowed = 'copy';
        });
    });
    workflowCanvas.addEventListener('dragover', (e) => e.preventDefault());
    workflowCanvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const nodeType = e.dataTransfer.getData('text/plain');
        if (nodeType) {
            addNodeFromPalette(nodeType, e.clientX, e.clientY);
        }
    });

    // Node config modal save button
    saveNodeConfigBtn.addEventListener('click', handleSaveNodeConfig);

    // Provider config save buttons
    saveProviderBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const providerName = btn.dataset.provider;
            let apiKey;
            let config = {};

            if (providerName === 'openai') {
                apiKey = openaiApiKeyInput.value;
                // Add any specific OpenAI config here if needed
            } else if (providerName === 'anthropic') {
                apiKey = anthropicApiKeyInput.value;
                // Add any specific Anthropic config here if needed
            }

            if (apiKey) {
                try {
                    await api.saveProvider(providerName, apiKey, config);
                    showStatus('Provider config saved!', 'success');
                    await loadProviderConfigs(); // Reload to update UI if needed
                } catch (error) {
                    showStatus(`Error saving ${providerName} config: ${error.message}`, 'error');
                }
            } else {
                showStatus('API Key cannot be empty.', 'error');
            }
        });
    });

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Canvas controls
    zoomInBtn.addEventListener('click', () => {
        const event = new WheelEvent('wheel', { deltaY: -100, clientX: workflowCanvas.width / 2, clientY: workflowCanvas.height / 2 });
        workflowCanvas.dispatchEvent(event);
    });
    zoomOutBtn.addEventListener('click', () => {
        const event = new WheelEvent('wheel', { deltaY: 100, clientX: workflowCanvas.width / 2, clientY: workflowCanvas.height / 2 });
        workflowCanvas.dispatchEvent(event);
    });
    resetViewBtn.addEventListener('click', resetView);
}

// --- Workflow Management ---
async function loadWorkflows() {
    try {
        const workflows = await api.fetchWorkflows();
        workflowList.innerHTML = '';
        if (workflows.length === 0) {
            workflowList.innerHTML = '<li>No workflows created yet.</li>';
        }
        workflows.forEach(wf => {
            const li = document.createElement('li');
            li.textContent = wf.name;
            li.dataset.id = wf.id;
            li.addEventListener('click', () => selectWorkflow(wf.id));

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.classList.add('delete-workflow-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent selecting workflow when deleting
                handleDeleteWorkflow(wf.id, wf.name);
            });
            li.appendChild(deleteBtn);

            workflowList.appendChild(li);
        });
        populateWorkflowSelect(workflows);

        // Load the first workflow by default if available
        if (workflows.length > 0) {
            selectWorkflow(workflows[0].id);
        }
    } catch (error) {
        console.error('Failed to load workflows:', error);
        alert('Failed to load workflows: ' + error.message);
    }
}

async function selectWorkflow(id) {
    try {
        // Deselect previous
        document.querySelectorAll('#workflow-list li').forEach(li => li.classList.remove('selected'));
        const selectedLi = document.querySelector(`#workflow-list li[data-id="${id}"]`);
        if (selectedLi) selectedLi.classList.add('selected');

        const workflow = await api.getWorkflow(id);
        currentWorkflow = workflow;
        loadWorkflow(currentWorkflow.data);
        console.log('Workflow loaded:', currentWorkflow.name);
        showStatus(`Workflow "${currentWorkflow.name}" loaded.`, 'success');
    } catch (error) {
        console.error('Failed to load workflow:', error);
        alert('Failed to load workflow: ' + error.message);
    }
}

async function handleCreateWorkflow() {
    const name = workflowNameInput.value.trim();
    if (!name) {
        alert('Workflow name cannot be empty.');
        return;
    }
    try {
        const newWorkflow = await api.createWorkflow(name, { nodes: [], connections: [] });
        currentWorkflow = newWorkflow;
        loadWorkflow(currentWorkflow.data);
        closeModal(workflowModal);
        workflowNameInput.value = '';
        await loadWorkflows(); // Refresh list
        selectWorkflow(newWorkflow.id); // Select the newly created workflow
        showStatus(`Workflow "${newWorkflow.name}" created!`, 'success');
    } catch (error) {
        console.error('Failed to create workflow:', error);
        alert('Failed to create workflow: ' + error.message);
    }
}

async function handleSaveWorkflow() {
    if (!currentWorkflow) {
        alert('No workflow selected to save.');
        return;
    }
    try {
        const workflowData = getWorkflowData();
        const updatedWorkflow = await api.updateWorkflow(currentWorkflow.id, currentWorkflow.name, workflowData);
        currentWorkflow = updatedWorkflow;
        showStatus(`Workflow "${currentWorkflow.name}" saved!`, 'success');
    } catch (error) {
        console.error('Failed to save workflow:', error);
        alert('Failed to save workflow: ' + error.message);
    }
}

async function handleDeleteWorkflow(id, name) {
    if (confirm(`Are you sure you want to delete workflow "${name}"?`)) {
        try {
            await api.deleteWorkflow(id);
            if (currentWorkflow && currentWorkflow.id === id) {
                currentWorkflow = null;
                loadWorkflow({ nodes: [], connections: [] }); // Clear canvas
            }
            await loadWorkflows(); // Refresh list
            showStatus(`Workflow "${name}" deleted.`, 'success');
        } catch (error) {
            console.error('Failed to delete workflow:', error);
            alert('Failed to delete workflow: ' + error.message);
        }
    }
}

function handleWorkflowUpdate(workflowData) {
    if (currentWorkflow) {
        currentWorkflow.data = workflowData;
        // Auto-save or indicate unsaved changes
        // For this prototype, we'll rely on explicit save button or a debounced auto-save
        // console.log('Workflow data updated in memory.');
    }
}

// --- Node Configuration ---
function handleNodeClick(node) {
    activeNodeForConfig = node;
    nodeConfigTitle.textContent = `Configure ${node.label} Node`;
    renderNodeConfigForm(node);
    openModal(nodeConfigModal);
}

function renderNodeConfigForm(node) {
    nodeConfigForm.innerHTML = '';
    const nodeDef = nodeTypes[node.type];

    if (!nodeDef || !nodeDef.form) {
        nodeConfigForm.innerHTML = '<p>No configurable properties for this node type.</p>';
        return;
    }

    nodeDef.form.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.classList.add('form-group');

        const label = document.createElement('label');
        label.setAttribute('for', `node-config-${field.id}`);
        label.textContent = field.label + ':';
        formGroup.appendChild(label);

        let inputElement;
        switch (field.type) {
            case 'text':
            case 'number':
            case 'password':
                inputElement = document.createElement('input');
                inputElement.type = field.type;
                if (field.min !== undefined) inputElement.min = field.min;
                if (field.max !== undefined) inputElement.max = field.max;
                if (field.step !== undefined) inputElement.step = field.step;
                break;
            case 'textarea':
                inputElement = document.createElement('textarea');
                break;
            case 'select':
                inputElement = document.createElement('select');
                field.options.forEach(optionValue => {
                    const option = document.createElement('option');
                    option.value = optionValue;
                    option.textContent = optionValue;
                    inputElement.appendChild(option);
                });
                break;
            default:
                inputElement = document.createElement('input');
                inputElement.type = 'text';
        }

        inputElement.id = `node-config-${field.id}`;
        inputElement.name = field.id;
        inputElement.value = node.config[field.id] !== undefined ? node.config[field.id] : (field.placeholder || '');
        if (field.placeholder) inputElement.placeholder = field.placeholder;

        formGroup.appendChild(inputElement);
        nodeConfigForm.appendChild(formGroup);
    });
}

function handleSaveNodeConfig() {
    if (!activeNodeForConfig) return;

    const newConfig = {};
    const nodeDef = nodeTypes[activeNodeForConfig.type];

    nodeDef.form.forEach(field => {
        const inputElement = document.getElementById(`node-config-${field.id}`);
        if (inputElement) {
            if (field.type === 'number') {
                newConfig[field.id] = parseFloat(inputElement.value);
            } else {
                newConfig[field.id] = inputElement.value;
            }
        }
    });

    updateNodeConfig(activeNodeForConfig.id, newConfig);
    closeModal(nodeConfigModal);
    activeNodeForConfig = null;
    showStatus('Node configuration saved.', 'success');
}

// --- Provider Configuration ---
async function openProviderConfigModal() {
    await loadProviderConfigs();
    openModal(providerConfigModal);
}

async function loadProviderConfigs() {
    try {
        const configs = await api.fetchProviders();
        const openaiConfig = configs.find(c => c.provider_name === 'openai');
        const anthropicConfig = configs.find(c => c.provider_name === 'anthropic');

        // We don't retrieve API keys for security, just check if they exist
        openaiApiKeyInput.value = openaiConfig ? '********' : '';
        anthropicApiKeyInput.value = anthropicConfig ? '********' : '';

        // Display status
        let statusMessage = '';
        if (openaiConfig) statusMessage += 'OpenAI: Configured. ';
        else statusMessage += 'OpenAI: Not configured. ';
        if (anthropicConfig) statusMessage += 'Anthropic: Configured.';
        else statusMessage += 'Anthropic: Not configured.';

        providerStatusDiv.textContent = statusMessage;

    } catch (error) {
        console.error('Failed to load provider configs:', error);
        providerStatusDiv.textContent = `Error loading configs: ${error.message}`;
        providerStatusDiv.style.color = 'red';
    }
}

// --- Modals & Notifications ---
function openModal(modalElement) {
    modalElement.style.display = 'flex';
}

function closeModal(modalElement) {
    modalElement.style.display = 'none';
}

function showStatus(message, type = 'info') {
    const statusDiv = document.createElement('div');
    statusDiv.textContent = message;
    statusDiv.style.position = 'fixed';
    statusDiv.style.bottom = '20px';
    statusDiv.style.right = '20px';
    statusDiv.style.padding = '10px 20px';
    statusDiv.style.borderRadius = '5px';
    statusDiv.style.zIndex = '1000';
    statusDiv.style.color = 'white';

    if (type === 'success') {
        statusDiv.style.backgroundColor = 'var(--primary-color)';
    } else if (type === 'error') {
        statusDiv.style.backgroundColor = 'var(--node-end-color)';
    } else {
        statusDiv.style.backgroundColor = 'var(--secondary-color)';
    }

    document.body.appendChild(statusDiv);

    setTimeout(() => {
        statusDiv.remove();
    }, 3000);
}
