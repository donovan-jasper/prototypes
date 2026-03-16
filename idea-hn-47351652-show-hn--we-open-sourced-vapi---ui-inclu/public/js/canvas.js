import { nodeTypes, createNode } from './nodes.js';

const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const PORT_RADIUS = 6;
const GRID_SIZE = 20;

let canvas, ctx;
let nodes = [];
let connections = [];
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDraggingCanvas = false;
let dragStartX, dragStartY;
let selectedNode = null;
let isDraggingNode = false;
let dragNodeOffsetX, dragNodeOffsetY;
let connectingNode = null;
let connectingPort = null;
let currentMouseX, currentMouseY;

let onWorkflowUpdateCallback = () => {};
let onNodeClickCallback = () => {};

export function initCanvas(canvasElement, onUpdate, onNodeClick) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    onWorkflowUpdateCallback = onUpdate;
    onNodeClickCallback = onNodeClick;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('contextmenu', handleContextMenu);

    requestAnimationFrame(draw);
}

export function loadWorkflow(workflowData) {
    nodes = workflowData.nodes || [];
    connections = workflowData.connections || [];
    resetView();
    draw();
}

export function getWorkflowData() {
    return { nodes, connections };
}

export function addNodeFromPalette(type, clientX, clientY) {
    const canvasRect = canvas.getBoundingClientRect();
    const x = (clientX - canvasRect.left - offsetX) / scale;
    const y = (clientY - canvasRect.top - offsetY) / scale;
    const newNode = createNode(type, x - NODE_WIDTH / 2, y - NODE_HEIGHT / 2);
    nodes.push(newNode);
    onWorkflowUpdateCallback(getWorkflowData());
    draw();
}

export function updateNodeConfig(nodeId, newConfig) {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
        node.config = { ...node.config, ...newConfig };
        onWorkflowUpdateCallback(getWorkflowData());
        draw();
    }
}

export function deleteNode(nodeId) {
    nodes = nodes.filter(n => n.id !== nodeId);
    connections = connections.filter(c => c.from !== nodeId && c.to !== nodeId);
    onWorkflowUpdateCallback(getWorkflowData());
    draw();
}

export function resetView() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    draw();
}

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    drawGrid();
    drawConnections();
    drawNodes();

    // Draw connecting line if active
    if (connectingNode && connectingPort) {
        const startPos = getNodePortPosition(connectingNode, connectingPort, 'output');
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentMouseX, currentMouseY);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.restore();
}

function drawGrid() {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;

    const scaledGridSize = GRID_SIZE * scale;
    const startX = (-offsetX % scaledGridSize) / scale;
    const startY = (-offsetY % scaledGridSize) / scale;

    for (let x = startX; x < canvas.width / scale; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height / scale);
        ctx.stroke();
    }

    for (let y = startY; y < canvas.height / scale; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width / scale, y);
        ctx.stroke();
    }
}

function drawNodes() {
    nodes.forEach(node => {
        ctx.fillStyle = node.color || '#607D8B'; // Default node color
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;

        const x = node.position.x;
        const y = node.position.y;

        // Draw node rectangle
        ctx.beginPath();
        ctx.roundRect(x, y, NODE_WIDTH, NODE_HEIGHT, 8);
        ctx.fill();
        ctx.stroke();

        // Draw node label
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, x + NODE_WIDTH / 2, y + NODE_HEIGHT / 2);

        // Draw input/output ports
        for (let i = 0; i < node.inputs; i++) {
            drawPort(node, i, 'input');
        }
        for (let i = 0; i < node.outputs; i++) {
            drawPort(node, i, 'output');
        }
    });
}

function drawPort(node, index, type) {
    const pos = getNodePortPosition(node, index, type);
    ctx.fillStyle = '#eee';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, PORT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function drawConnections() {
    connections.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);

        if (fromNode && toNode) {
            const startPos = getNodePortPosition(fromNode, conn.fromPort, 'output');
            const endPos = getNodePortPosition(toNode, conn.toPort, 'input');

            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);

            // Draw a bezier curve
            const cp1x = startPos.x + 50;
            const cp1y = startPos.y;
            const cp2x = endPos.x - 50;
            const cp2y = endPos.y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endPos.x, endPos.y);
            ctx.stroke();
        }
    });
}

function getNodePortPosition(node, portIndex, type) {
    const x = node.position.x;
    const y = node.position.y;
    if (type === 'input') {
        return {
            x: x,
            y: y + NODE_HEIGHT / (node.inputs + 1) * (portIndex + 1)
        };
    } else { // output
        return {
            x: x + NODE_WIDTH,
            y: y + NODE_HEIGHT / (node.outputs + 1) * (portIndex + 1)
        };
    }
}

function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left - offsetX) / scale,
        y: (event.clientY - rect.top - offsetY) / scale
    };
}

function getCanvasMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function hitTestNode(mousePos) {
    for (const node of nodes) {
        if (mousePos.x > node.position.x && mousePos.x < node.position.x + NODE_WIDTH &&
            mousePos.y > node.position.y && mousePos.y < node.position.y + NODE_HEIGHT) {
            return node;
        }
    }
    return null;
}

function hitTestPort(mousePos) {
    for (const node of nodes) {
        for (let i = 0; i < node.inputs; i++) {
            const portPos = getNodePortPosition(node, i, 'input');
            const dist = Math.sqrt(Math.pow(mousePos.x - portPos.x, 2) + Math.pow(mousePos.y - portPos.y, 2));
            if (dist < PORT_RADIUS) {
                return { node, portIndex: i, type: 'input' };
            }
        }
        for (let i = 0; i < node.outputs; i++) {
            const portPos = getNodePortPosition(node, i, 'output');
            const dist = Math.sqrt(Math.pow(mousePos.x - portPos.x, 2) + Math.pow(mousePos.y - portPos.y, 2));
            if (dist < PORT_RADIUS) {
                return { node, portIndex: i, type: 'output' };
            }
        }
    }
    return null;
}

function handleMouseDown(event) {
    const mousePos = getMousePos(event);
    const canvasMousePos = getCanvasMousePos(event);

    if (event.button === 0) { // Left click
        const clickedPort = hitTestPort(mousePos);
        if (clickedPort && clickedPort.type === 'output') {
            connectingNode = clickedPort.node;
            connectingPort = clickedPort.portIndex;
            currentMouseX = canvasMousePos.x;
            currentMouseY = canvasMousePos.y;
            canvas.style.cursor = 'crosshair';
            return;
        }

        selectedNode = hitTestNode(mousePos);
        if (selectedNode) {
            isDraggingNode = true;
            dragNodeOffsetX = mousePos.x - selectedNode.position.x;
            dragNodeOffsetY = mousePos.y - selectedNode.position.y;
            canvas.style.cursor = 'grabbing';
            onNodeClickCallback(selectedNode); // Open config modal
        } else {
            isDraggingCanvas = true;
            dragStartX = event.clientX - offsetX;
            dragStartY = event.clientY - offsetY;
            canvas.style.cursor = 'grabbing';
        }
    }
}

function handleMouseMove(event) {
    const mousePos = getMousePos(event);
    const canvasMousePos = getCanvasMousePos(event);

    if (isDraggingCanvas) {
        offsetX = event.clientX - dragStartX;
        offsetY = event.clientY - dragStartY;
        draw();
    } else if (isDraggingNode && selectedNode) {
        selectedNode.position.x = mousePos.x - dragNodeOffsetX;
        selectedNode.position.y = mousePos.y - dragNodeOffsetY;
        draw();
    } else if (connectingNode) {
        currentMouseX = mousePos.x;
        currentMouseY = mousePos.y;
        draw();
    } else {
        // Update cursor for hover states
        const hoveredPort = hitTestPort(mousePos);
        const hoveredNode = hitTestNode(mousePos);
        if (hoveredPort) {
            canvas.style.cursor = 'crosshair';
        } else if (hoveredNode) {
            canvas.style.cursor = 'grab';
        } else {
            canvas.style.cursor = 'default';
        }
    }
}

function handleMouseUp(event) {
    const mousePos = getMousePos(event);

    if (connectingNode) {
        const targetPort = hitTestPort(mousePos);
        if (targetPort && targetPort.type === 'input' && targetPort.node.id !== connectingNode.id) {
            // Check for existing connection to prevent duplicates
            const existingConnection = connections.find(
                c => c.from === connectingNode.id && c.fromPort === connectingPort &&
                     c.to === targetPort.node.id && c.toPort === targetPort.portIndex
            );
            if (!existingConnection) {
                connections.push({
                    id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    from: connectingNode.id,
                    fromPort: connectingPort,
                    to: targetPort.node.id,
                    toPort: targetPort.portIndex,
                    condition: '' // For branch nodes, this can be set later
                });
                onWorkflowUpdateCallback(getWorkflowData());
            }
        }
        connectingNode = null;
        connectingPort = null;
        canvas.style.cursor = 'default';
        draw();
    }

    if (isDraggingCanvas || isDraggingNode) {
        isDraggingCanvas = false;
        isDraggingNode = false;
        selectedNode = null;
        canvas.style.cursor = 'default';
        onWorkflowUpdateCallback(getWorkflowData()); // Save changes after drag
    }
}

function handleWheel(event) {
    event.preventDefault(); // Prevent page scrolling

    const mousePos = getMousePos(event); // Mouse position in canvas coordinates before zoom

    const zoomFactor = 1.1;
    const oldScale = scale;

    if (event.deltaY < 0) {
        scale *= zoomFactor; // Zoom in
    } else {
        scale /= zoomFactor; // Zoom out
    }

    // Clamp scale to reasonable limits
    scale = Math.max(0.2, Math.min(3, scale));

    // Adjust offset to zoom towards the mouse pointer
    offsetX = event.clientX - (mousePos.x * scale);
    offsetY = event.clientY - (mousePos.y * scale);

    draw();
}

function handleContextMenu(event) {
    event.preventDefault();
    const mousePos = getMousePos(event);
    const clickedNode = hitTestNode(mousePos);

    if (clickedNode) {
        if (confirm(`Delete node "${clickedNode.label}"?`)) {
            deleteNode(clickedNode.id);
        }
    }
}
