import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getProviderConfigs, getProviderConfigByName, saveProviderConfig, deleteProviderConfig } from '../db.js';

const router = Router();

// GET /api/providers - List configured providers (sanitized)
router.get('/', (req, res) => {
    try {
        const configs = getProviderConfigs();
        res.json(configs.map(c => ({
            id: c.id,
            provider_name: c.provider_name,
            config: c.config,
            // Do NOT send api_key to frontend
        })));
    } catch (error) {
        console.error('Error fetching provider configs:', error);
        res.status(500).json({ error: 'Failed to fetch provider configurations' });
    }
});

// POST /api/providers - Add/update provider config
router.post('/', (req, res) => {
    try {
        const { provider_name, api_key, config } = req.body;
        if (!provider_name || !api_key) {
            return res.status(400).json({ error: 'Provider name and API key are required' });
        }

        const id = uuidv4();
        const savedConfig = saveProviderConfig(id, provider_name, api_key, config || {});
        res.status(200).json({
            id: savedConfig.id,
            provider_name: savedConfig.provider_name,
            config: savedConfig.config,
            message: 'Provider configuration saved successfully'
        });
    } catch (error) {
        console.error('Error saving provider config:', error);
        res.status(500).json({ error: 'Failed to save provider configuration' });
    }
});

// DELETE /api/providers/:name - Remove provider config
router.delete('/:name', (req, res) => {
    try {
        const { name } = req.params;
        const result = deleteProviderConfig(name);
        res.json(result);
    } catch (error) {
        console.error('Error deleting provider config:', error);
        res.status(500).json({ error: 'Failed to delete provider configuration' });
    }
});

export default router;
