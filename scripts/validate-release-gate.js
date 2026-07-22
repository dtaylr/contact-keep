const fs = require('fs');
const path = require('path');

const gatePath = path.join(__dirname, '..', 'quality', 'release-gate.json');
const gate = JSON.parse(fs.readFileSync(gatePath, 'utf8'));

const requiredCommands = new Set([
  'npm test',
  'npm run build --prefix client',
  'npm audit --omit=dev',
  'npm audit --prefix client --omit=dev',
  'npm run test:e2e:ci',
  'npm run test:e2e:ci:chrome:critical',
  'npm run test:e2e:ci:webkit:critical'
]);

const fail = message => {
  console.error(`Release gate invalid: ${message}`);
  process.exit(1);
};

if (!gate.name) {
  fail('name is required');
}

if (!Array.isArray(gate.requiredChecks) || gate.requiredChecks.length === 0) {
  fail('requiredChecks must be a non-empty array');
}

const commands = new Set();
gate.requiredChecks.forEach((check, index) => {
  if (!check.name || !check.command || !check.evidence) {
    fail(`requiredChecks[${index}] must include name, command, and evidence`);
  }

  commands.add(check.command);
});

requiredCommands.forEach(command => {
  if (!commands.has(command)) {
    fail(`missing required command "${command}"`);
  }
});

if (gate.signoffRequired !== true) {
  fail('signoffRequired must be true');
}

if (!Array.isArray(gate.releaseBlockers) || gate.releaseBlockers.length === 0) {
  fail('releaseBlockers must be a non-empty array');
}

console.log('Release gate valid');
