/*
Provides a nice but dead simple console logging experience.
Logged lines start with an ISO timestamp and debug level.
You can use this module in two ways. First is with plain
logging levels, like so:

  const log = require('./log');
  log.info('hello');
  //=> 2020-01-01T00:00:00.000Z [INFO] hello

If you want to apply a uniform prefix to your log messages,
you can do that real simply:

  const log = require('./log').withPrefix('[module]');
  log.info('hello');
  //=> 2020-01-01T00:00:00.000Z [INFO] [module] hello

*/

function logger(emitter, ...prefix) {
  return function (...args) {
    emitter(new Date().toISOString(), ...prefix, ...args);
  };
}

function loggersWithPrefix(...prefix) {
  return {
    withPrefix: function(...subprefix) { return loggersWithPrefix(...prefix, ...subprefix); },
    error: logger(console.error, '[ERROR]', ...prefix),
    warn: logger(console.warn, '[WARN]', ...prefix),
    info: logger(console.info, '[INFO]', ...prefix),
    debug: logger(console.debug, '[DEBUG]', ...prefix),
  };
}

module.exports = loggersWithPrefix();
