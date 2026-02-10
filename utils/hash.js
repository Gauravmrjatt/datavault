const crypto = require('crypto');

function sha256FromBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function sha256FromString(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = {
  sha256FromBuffer,
  sha256FromString
};
