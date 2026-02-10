const axios = require('axios');
const fs = require('fs-extra');
const TelegramBot = require('node-telegram-bot-api');
const { sha256FromBuffer } = require('../utils/hash');
const HttpError = require('../utils/httpError');

const MAX_TELEGRAM_RETRIES = 5;
const botCache = new Map();

function getBot(botToken) {
  if (!botToken) {
    throw new HttpError(400, 'Telegram bot token is required');
  }

  if (!botCache.has(botToken)) {
    botCache.set(botToken, new TelegramBot(botToken, { polling: false }));
  }

  return botCache.get(botToken);
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractRetryAfter(error) {
  const retryAfter = error?.response?.body?.parameters?.retry_after;
  if (typeof retryAfter === 'number') {
    return retryAfter * 1000;
  }
  return null;
}

async function withRateLimitRetry(task) {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_TELEGRAM_RETRIES; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      const retryAfterMs = extractRetryAfter(error) || attempt * 800;
      if (attempt < MAX_TELEGRAM_RETRIES) {
        await wait(retryAfterMs);
      }
    }
  }

  throw new HttpError(502, 'Telegram API request failed after retries', {
    error: lastError?.message || 'unknown_error'
  });
}

async function uploadChunk({ chunkPath, chunkIndex, fileId, originalName, botToken, chatId }) {
  const bot = getBot(botToken);
  if (!chatId) {
    throw new HttpError(400, 'Telegram storage chat id is required');
  }

  const fileBuffer = await fs.readFile(chunkPath);
  const checksum = sha256FromBuffer(fileBuffer);

  const captionPayload = {
    dv: 1,
    fileId,
    chunkIndex,
    originalName,
    checksum
  };

  const message = await withRateLimitRetry(async () => {
    return bot.sendDocument(chatId, chunkPath, {
      caption: JSON.stringify(captionPayload)
    });
  });

  if (!message?.document) {
    throw new HttpError(502, 'Telegram upload response did not contain document metadata');
  }

  return {
    chunkIndex,
    messageId: message.message_id,
    chatId: String(chatId),
    telegramFileId: message.document.file_id,
    telegramFileUniqueId: message.document.file_unique_id,
    size: fileBuffer.length,
    checksum
  };
}

async function getChunkBuffer(telegramFileId, botToken) {
  const bot = getBot(botToken);
  const file = await withRateLimitRetry(async () => bot.getFile(telegramFileId));

  if (!file?.file_path) {
    throw new HttpError(502, 'Unable to resolve Telegram file path');
  }

  const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

async function deleteChunkMessage(chatId, messageId, botToken) {
  if (!chatId || !messageId || !botToken) return false;

  const bot = getBot(botToken);
  try {
    await withRateLimitRetry(async () => bot.deleteMessage(chatId, messageId));
  } catch (_error) {
    return false;
  }
  return true;
}

async function fetchRecentTelegramStorageUpdates(limit = 500, botToken) {
  const bot = getBot(botToken);
  const updates = await withRateLimitRetry(async () => bot.getUpdates({ limit, timeout: 0 }));
  return updates || [];
}

module.exports = {
  uploadChunk,
  getChunkBuffer,
  deleteChunkMessage,
  fetchRecentTelegramStorageUpdates
};
