const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const requiredPaths = [
  'README.md',
  'AGENTS.md',
  '.env.example',
  '.github/CODEOWNERS',
  'agents/AGENTS.md',
  'agents/project.md',
  'agents/workflows.md',
  'agents/coding-standards.md',
  'agents/guardrails.json',
  'agents/context/architecture.md',
  'agents/context/domain-model.md',
  'agents/context/api-contracts.md',
  'agents/context/data-schemas.md',
  'agents/context/data-sensitivity.md',
  'docs/adr/README.md',
  'docs/runbooks/README.md',
  'tests',
  'docs',
  'scripts',
  'config'
];

const missing = requiredPaths.filter(relativePath => {
  return !fs.existsSync(path.join(root, relativePath));
});

if (missing.length > 0) {
  console.error('Repo structure invalid. Missing required paths:');
  missing.forEach(relativePath => console.error(`- ${relativePath}`));
  process.exit(1);
}

const guardrailsPath = path.join(root, 'agents', 'guardrails.json');
try {
  const guardrails = JSON.parse(fs.readFileSync(guardrailsPath, 'utf8'));

  if (!Array.isArray(guardrails.requireHumanSignoff)) {
    throw new Error('requireHumanSignoff must be an array');
  }

  if (!Array.isArray(guardrails.requirePlanFor)) {
    throw new Error('requirePlanFor must be an array');
  }
} catch (error) {
  console.error(`Repo structure invalid. agents/guardrails.json: ${error.message}`);
  process.exit(1);
}

console.log('Repo structure valid');
