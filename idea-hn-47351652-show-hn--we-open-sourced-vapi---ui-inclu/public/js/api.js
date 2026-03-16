const API_BASE_URL = '/api';

async function request(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.error || response.statusText);
    }
    return response.json();
}

export const api = {
    // Workflows
    fetchWorkflows: () => request('/workflows'),
    createWorkflow: (name, data) => request('/workflows', 'POST', { name, data }),
    getWorkflow: (id) => request(`/workflows/${id}`),
    updateWorkflow: (id, name, data) => request(`/workflows/${id}`, 'PUT', { name, data }),
    deleteWorkflow: (id) => request(`/workflows/${id}`, 'DELETE'),

    // Providers
    fetchProviders: () => request('/providers'),
    saveProvider: (provider_name, api_key, config) => request('/providers', 'POST', { provider_name, api_key, config }),
    deleteProvider: (provider_name) => request(`/providers/${provider_name}`, 'DELETE'),
};
