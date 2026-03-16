const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load or generate config
let configPath = path.join(__dirname, '../config.json');
let config;

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  config = {
    port: 3000,
    shell: "/bin/zsh",
    authToken: ""
  };
}

// Generate token if not exists
if (!config.authToken) {
  config.authToken = uuidv4();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function authenticateToken(req, res, next) {
  const token = req.query.token;
  
  if (!token || token !== config.authToken) {
    return res.status(401).send('Unauthorized: Invalid token');
  }
  
  next();
}

module.exports = {
  authenticateToken,
  config
};
