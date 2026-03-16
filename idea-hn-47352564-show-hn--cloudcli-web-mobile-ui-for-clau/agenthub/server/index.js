const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const sessionRoutes = require('./routes/sessions');
const fileRoutes = require('./routes/files');
const terminalRoutes = require('./routes/terminal');
const websocketHandler = require('./websocket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/sessions', sessionRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/terminal', terminalRoutes);

const workspacesDir = path.join(__dirname, '../workspaces');
if (!fs.existsSync(workspacesDir)) {
  fs.mkdirSync(workspacesDir);
}

websocketHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
