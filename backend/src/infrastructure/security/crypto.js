const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { config } = require('../../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_ROUNDS = 10;


async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Derives a 32-byte Buffer from the configured encryption key.
 */
function getEncryptionKey() {
  return crypto.scryptSync(config.security.dataEncryptionKey, 'amrutam-salt-v1', 32);
}

/**
 * Encrypts sensitive PHI (Protected Health Information) using AES-256-GCM.
 * Format: iv:authTag:encryptedHex
 */
function encryptPHI(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted string.
 */
function decryptPHI(cipherText) {
  if (!cipherText || !cipherText.includes(':')) return cipherText;
  try {
    const [ivHex, authTagHex, encrypted] = cipherText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return cipherText;
  }
}

/**
 * Generates an HMAC-SHA256 digital signature for prescriptions to guarantee integrity and authenticity.
 */
function generatePrescriptionSignature(payload) {
  const data = JSON.stringify({
    consultationId: payload.consultationId,
    doctorId: payload.doctorId,
    patientId: payload.patientId,
    diagnosis: payload.diagnosis,
    medications: payload.medications,
    timestamp: new Date(payload.timestamp).toISOString()
  });

  return crypto
    .createHmac('sha256', config.security.doctorSignatureSecret)
    .update(data)
    .digest('hex');
}

/**
 * Verifies a prescription's digital signature.
 */
function verifyPrescriptionSignature(payload, signature) {
  const expected = generatePrescriptionSignature(payload);
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
}

module.exports = {
  hashPassword,
  comparePassword,
  encryptPHI,
  decryptPHI,
  generatePrescriptionSignature,
  verifyPrescriptionSignature
};
