const crypto = require('crypto');

function getKey() {
  const source = process.env.TELEGRAM_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!source) {
    throw new Error('TELEGRAM_TOKEN_ENCRYPTION_KEY or JWT_SECRET must be configured');
  }
  return crypto.createHash('sha256').update(String(source)).digest();
}

function encryptText(plainText) {
  if (!plainText) return null;
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptText(payload) {
  if (!payload) return null;
  const [ivHex, tagHex, encryptedHex] = String(payload).split(':');
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error('Invalid encrypted payload format');
  }
  const key = getKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

function maskToken(token) {
  if (!token) return null;
  if (token.length <= 8) return '********';
  return `${token.slice(0, 4)}****${token.slice(-4)}`;
}

module.exports = {
  encryptText,
  decryptText,
  maskToken
};
