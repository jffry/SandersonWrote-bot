const Twitter = require('twitter-lite');
const auth = require('./auth');
const log = require('./log').withPrefix('[twitter]');

const client = new Twitter(auth.getAuth('twitter'));

exports.MAX_TWEET_LENGTH = 280;

exports.chunkLinesIntoTweets = function(lines, limit = exports.MAX_TWEET_LENGTH) {
  let messages = [];
  let message = null;
  const separator = '\n';
  for (let line of lines) {
    //TODO: if the first line of a message is too long, what to do?
    //As implemented, it will end up as its own message, and anything that's too long
    //will get truncated by Twitter
    if (message === null) {
      message = line;
    } else if (message.length + separator.length + line.length <= limit) {
      message += separator + line;
    } else {
      messages.push(message);
      message = line;
    }
  }
  if (message !== null && message.length > 0) {
    messages.push(message);
  }
  return messages;
}

exports.verifyCredentials = function () {
  return client.get('account/verify_credentials');
};

exports.tweet = function (message) {
  log.info('Tweeting:\n' + message);
  return client.post('statuses/update', {
    status: message
  });
};
