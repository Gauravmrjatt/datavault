const bcrypt = require('bcryptjs');
const { SignJWT } = require('jose');
const User = require('../models/User');
const HttpError = require('../utils/httpError');

async function signToken(user) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return new SignJWT({
    userId: String(user._id),
    email: user.email,
    name: user.name
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

exports.signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new HttpError(400, 'Name, email and password are required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new HttpError(409, 'Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: normalizedEmail,
      name: String(name).trim(),
      passwordHash
    });

    const token = await signToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        telegramConfigured: Boolean(user.telegramConfig?.botTokenEnc && user.telegramConfig?.storageChatId),
        quotaBytes: user.quotaBytes,
        usedBytes: user.usedBytes
      }
    });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) throw new HttpError(401, 'Invalid credentials');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new HttpError(401, 'Invalid credentials');

    const token = await signToken(user);
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        telegramConfigured: Boolean(user.telegramConfig?.botTokenEnc && user.telegramConfig?.storageChatId),
        quotaBytes: user.quotaBytes,
        usedBytes: user.usedBytes
      }
    });
  } catch (error) {
    return next(error);
  }
};

exports.me = async (req, res) => {
  const user = req.user;
  return res.status(200).json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      telegramConfigured: Boolean(user.telegramConfig?.botTokenEnc && user.telegramConfig?.storageChatId),
      quotaBytes: user.quotaBytes,
      usedBytes: user.usedBytes
    }
  });
};
