require('dotenv').config();

const fs = require('fs');
const path = require('path');

const readConfigFile = name => {
  const configPath = path.join(__dirname, `${name}.json`);

  if (!fs.existsSync(configPath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
};

const fileConfig = {
  ...readConfigFile('default'),
  ...readConfigFile(process.env.NODE_ENV || 'development')
};

const getConfigValue = (envName, configName, fallback = undefined) => {
  if (process.env[envName]) {
    return process.env[envName];
  }

  if (fileConfig[configName]) {
    return fileConfig[configName];
  }

  return fallback;
};

const appConfig = {
  mongoURI: getConfigValue('MONGO_URI', 'mongoURI'),
  jwtSecret: getConfigValue('JWT_SECRET', 'jwtSecret'),
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000
};

const requireConfig = key => {
  if (!appConfig[key]) {
    throw new Error(`Missing required config: ${key}`);
  }

  return appConfig[key];
};

module.exports = {
  appConfig,
  requireConfig
};
