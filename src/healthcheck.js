const auth = require('./auth');
const log = require('./log').withPrefix('[healthcheck]');
const request = require('./request');

exports.pingSuccess = function () {
  log.info('Sending SUCCESS');
  let urls = auth.getAuth('healthcheck');
  return request.get(urls.success);
};

exports.pingFailed = function () {
  log.error('Sending FAILURE');
  let urls = auth.getAuth('healthcheck');
  return request.get(urls.failure);
};
