const User = require('../models/User');
const HttpError = require('../utils/httpError');
const { encryptText, decryptText, maskToken } = require('../utils/crypto');

function resolveFallbackConfig() {
  const botToken = process.env.BOT_TOKEN || null;
  const storageChatId = process.env.TELEGRAM_STORAGE_CHAT_ID || process.env.CHANNEL_USERNAME || null;
  return { botToken, storageChatId };
}

async function saveTelegramConfig(ownerId, { botToken, storageChatId }) {
  if (!botToken || !storageChatId) {
    throw new HttpError(400, 'botToken and storageChatId are required');
  }

  const user = await User.findById(ownerId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  user.telegramConfig = {
    botTokenEnc: encryptText(String(botToken).trim()),
    storageChatId: String(storageChatId).trim(),
    configuredAt: new Date()
  };
  await user.save();

  return {
    configured: true,
    storageChatId: user.telegramConfig.storageChatId,
    botTokenMasked: maskToken(String(botToken).trim()),
    configuredAt: user.telegramConfig.configuredAt
  };
}

async function getTelegramConfig(ownerId, { allowFallback = true, requireConfigured = false } = {}) {
  const user = await User.findById(ownerId).lean();
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const hasUserConfig = Boolean(user.telegramConfig?.botTokenEnc && user.telegramConfig?.storageChatId);
  if (hasUserConfig) {
    const botToken = decryptText(user.telegramConfig.botTokenEnc);
    return {
      source: 'user',
      configured: true,
      botToken,
      botTokenMasked: maskToken(botToken),
      storageChatId: user.telegramConfig.storageChatId,
      configuredAt: user.telegramConfig.configuredAt || null
    };
  }

  if (allowFallback) {
    const fallback = resolveFallbackConfig();
    if (fallback.botToken && fallback.storageChatId) {
      return {
        source: 'env',
        configured: true,
        botToken: fallback.botToken,
        botTokenMasked: maskToken(fallback.botToken),
        storageChatId: fallback.storageChatId,
        configuredAt: null
      };
    }
  }

  if (requireConfigured) {
    throw new HttpError(
      400,
      'Telegram storage is not configured. Set bot token and storage chat in Settings before uploading.'
    );
  }

  return {
    source: 'none',
    configured: false,
    botToken: null,
    botTokenMasked: null,
    storageChatId: null,
    configuredAt: null
  };
}

module.exports = {
  saveTelegramConfig,
  getTelegramConfig
};
