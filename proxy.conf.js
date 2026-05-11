const fs = require('fs');
const path = require('path');

// Basic parser for .env files
function getEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const env = {};
    lines.forEach(line => {
      const [key, ...value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.join('=').trim();
      }
    });
    return env;
  } catch (e) {
    return {};
  }
}

const env = getEnv(path.join(__dirname, '.env.local'));
const apiUrl = env.API_URL ;
// const apiUrl = env.API_URL || 'https://specialcart-dashboard.tryasp.net/api';

// Remove the /api suffix for the proxy target if it exists
// because the proxy adds the path from the request
const target = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

console.log('Proxy targeting:', target);

const PROXY_CONFIG = {
  "/api": {
    "target": target,
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
};

module.exports = PROXY_CONFIG;
