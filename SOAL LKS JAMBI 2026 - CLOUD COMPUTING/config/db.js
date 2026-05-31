const { Sequelize } = require('sequelize');

const secretId = process.env.AWS_SECRET_ARN || process.env.AWS_SECRET_NAME || process.env.DB_SECRET_NAME;
const awsRegion = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ISI_REGION_AWS';
const rdsHost = process.env.DB_HOST || 'ISI_ENDPOINT_RDS_KAMU';

let cachedDbSecret;
let secretsManagerClient;

function isEnabled(value) {
  return ['1', 'true', 'yes'].includes(String(value).toLowerCase());
}

function toPort(value, fallback) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : fallback;
}

function decodeSecretBinary(secretBinary) {
  if (typeof secretBinary === 'string') {
    return Buffer.from(secretBinary, 'base64').toString('utf8');
  }

  return Buffer.from(secretBinary).toString('utf8');
}

async function getDbSecret() {
  if (!secretId) {
    return null;
  }

  if (cachedDbSecret) {
    return cachedDbSecret;
  }

  const { GetSecretValueCommand, SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');

  if (!secretsManagerClient) {
    secretsManagerClient = new SecretsManagerClient({ region: awsRegion });
  }

  const response = await secretsManagerClient.send(new GetSecretValueCommand({ SecretId: secretId }));
  const secretValue = response.SecretString || decodeSecretBinary(response.SecretBinary);

  try {
    cachedDbSecret = JSON.parse(secretValue);
    return cachedDbSecret;
  } catch (error) {
    throw new Error(`Secret ${secretId} harus berupa JSON credential database RDS.`);
  }
}

function applySecretToConfig(config, secret) {
  config.database = secret.dbname || secret.database || config.database;
  config.username = secret.username || secret.user || config.username;
  config.password = secret.password || config.password;
  config.host = secret.host || config.host;
  config.port = toPort(secret.port, config.port);
}

function buildDialectOptions() {
  if (!isEnabled(process.env.DB_SSL)) {
    return {};
  }

  return {
    ssl: {
      require: true,
      rejectUnauthorized: !isEnabled(process.env.DB_SSL_ALLOW_UNAUTHORIZED)
    }
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'db_lks',
  process.env.DB_USER || 'placeholder_user',
  process.env.DB_PASSWORD || 'placeholder_password',
  {
    host: rdsHost,
    port: toPort(process.env.DB_PORT, 3306),
    dialect: process.env.DB_DIALECT || 'mysql',
    dialectOptions: buildDialectOptions(),
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    hooks: {
      beforeConnect: async (config) => {
        const secret = await getDbSecret();

        if (secret) {
          applySecretToConfig(config, secret);
        }
      }
    }
  }
);

module.exports = sequelize;
