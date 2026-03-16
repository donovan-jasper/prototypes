import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getWorkflows, getWorkflowById, createWorkflow, updateWorkflow, deleteWorkflow } from '../db.js';

const router = Router();

// GET /api/workflows - List all workflows
router.get('/', (req, res) => {
    try {
        const workflows = getWorkflows();
        res.json(workflows.map(w => ({
            ...w,
            data: w.data ? JSON.parse(w.data) : { nodes: [], connections: [] }
        })));
    } catch (error) {
        console.error('Error fetching workflows:', error);
        res.status(500).json({ error: 'Failed to fetch workflows' });
    }
});

// POST /api/workflows - Create new workflow
router.post('/', (req, res) => {
    try {
        const { name, data } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Workflow name is required' });
        }
        const id = uuidv4();
        const newWorkflow = createWorkflow(id, name, data || { nodes: [], connections: [] });
        res.status(201).json({
            ...newWorkflow,
            data: newWorkflow.data ? JSON.parse(newWorkflow.data) : { nodes: [], connections: [] }
        });
    } catch (error) {
        console.error('Error creating workflow:', error);
        res.status(500).json({ error: 'Failed to create workflow' });
    }
});

// GET /api/workflows/:id - Get workflow by ID
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const workflow = getWorkflowById(id);
        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        res.json({
            ...workflow,
            data: workflow.data ? JSON.parse(workflow.data) : { nodes: [], connections: [] }
        });
    } catch (error) {
        console.error('Error fetching workflow by ID:', error);
        res.status(500).json({ error: 'Failed to fetch workflow' });
    }
});

// PUT /api/workflows/:id - Update workflow data
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, data } = req.body;
        if (!data) {
            return res.status(400).json({ error: 'Workflow data is required' });
        }
        const existingWorkflow = getWorkflowById(id);
        if (!existingWorkflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        const updatedWorkflow = updateWorkflow(id, name || existingWorkflow.name, data);
        res.json({
            ...updatedWorkflow,
            data: updatedWorkflow.data ? JSON.parse(updatedWorkflow.data) : { nodes: [], connections: [] }
        });
    } catch (error) {
        console.error('Error updating workflow:', error);
        res.status(500).json({ error: 'Failed to update workflow' });
    }
});

// DELETE /api/workflows/:id - Delete workflow
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const result = deleteWorkflow(id);
        res.json(result);
    } catch (error) {
        console.error('Error deleting workflow:', error);
        res.status(500).json({ error: 'Failed to delete workflow' });
    }
});

export default router;
