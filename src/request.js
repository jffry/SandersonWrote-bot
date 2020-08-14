const https = require('https');

exports.request = function (url, options) {
  return new Promise((resolve, reject) => {
    https.request(url, resp => {
      let responseBody = '';
      resp.on('data', chunk => responseBody += chunk);
      resp.on('end', () => resolve(responseBody));
      resp.on('error', reject);
    }).end();
  });
};

exports.post = function (url, options) {
  return exports.request(url, {method: 'POST', ...options});
}

exports.get = function (url, options) {
  return exports.request(url, {method: 'GET', ...options});
}
