const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Determine the path to config.json relative to this module
const configPath = path.join(__dirname, '../config.json');
let config;

try {
  // Attempt to read existing config.json
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  // If config.json doesn't exist or is invalid JSON, create a default one
  console.warn(`config.json not found or invalid. Creating a default one at ${configPath}.`);
  config = {
    port: 3000,
    shell: "/bin/zsh", // Default shell for macOS
    authToken: "" // Placeholder for generated token
  };
}

// Generate a new authToken if it's empty or the placeholder value
if (!config.authToken || config.authToken === "generated-on-first-run") {
  config.authToken = uuidv4(); // Generate a unique token
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Generated new authToken in config.json: ${config.authToken}`);
  } catch (writeErr) {
    console.error(`Failed to write new authToken to config.json: ${writeErr.message}`);
    // If writing fails, the server might still proceed with the generated token in memory,
    // but it won't be persistent. This is a critical error for first-run setup.
  }
}

/**
 * Express middleware for authenticating requests using a query parameter token.
 * @param {import('express').Request} req The Express request object.
 * @param {import('express').Response} res The Express response object.
 * @param {import('express').NextFunction} next The Express next middleware function.
 */
function authenticateToken(req, res, next) {
  const token = req.query.token;
  
  if (!token || token !== config.authToken) {
    console.warn(`Unauthorized access attempt from ${req.ip}. Provided token: "${token}", Expected: "${config.authToken}"`);
    return res.status(401).send('Unauthorized: Invalid token');
  }
  
  next();
}

module.exports = {
  authenticateToken,
  config // Export the loaded/generated config for use by other modules
};
