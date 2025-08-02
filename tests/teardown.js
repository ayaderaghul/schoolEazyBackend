const { stop } = require('./setup');

module.exports = async () => {
  await stop();
};