const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/environments/environment.prod.ts');
const packageJson = require('../package.json');

// Get the API URL from environment variables, fallback to '/api' if not set
const apiUrl = process.env.API_URL || '/api';

const envConfigFile = `import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: '${apiUrl}'
};
`;

console.log(`Generating environment file at ${targetPath} with apiUrl: ${apiUrl}`);

fs.writeFileSync(targetPath, envConfigFile, { encoding: 'utf8' });
