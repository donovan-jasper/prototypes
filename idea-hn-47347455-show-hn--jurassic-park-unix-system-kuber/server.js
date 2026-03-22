const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send mock metric data at regular intervals
  setInterval(() => {
    const cpu = Math.floor(Math.random() * 101);
    const memory = Math.floor(Math.random() * 101);
    const disk = Math.floor(Math.random() * 101);

    ws.send(JSON.stringify({ cpu, memory, disk }));
  }, 1000);

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
