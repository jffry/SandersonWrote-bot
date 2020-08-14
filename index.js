const cron = require('node-cron');
const log = require('./src/log').withPrefix('[index.js]');
const twitter = require('./src/twitter');
const healthcheck = require('./src/healthcheck');
const scrape = require('./src/scrape');
const state = require('./src/state');


//just die and let the container restart if something goes wrong down in a promise
process.on('unhandledRejection', error => {
  log.error('uncaught failure in promise', error);
  log.warn('terminating process...');
  process.exit(1);
});

let priorStatuses = state.loadStateMap();

async function checkAndUpdate() {
  log.info('Checking for updates...');
  let currentStatuses = await scrape.getStatuses();
  if (!currentStatuses || currentStatuses.size === 0) {
    log.error('Failed to scrape progress bars');
    return;
  }
  let diff = scrape.diffStatuses(priorStatuses, currentStatuses);
  let lines = scrape.humanReadableDiff(diff);
  if (lines && lines.length > 0) {
    //TODO: do we want to be fancy and Tweet these in a thread?
    for (let message of twitter.chunkLinesIntoTweets(lines)) {
      await twitter.tweet(message);
    }
    //We deliberately won't save state if we couldn't Tweet it
    state.saveStateMap(currentStatuses);
    priorStatuses = currentStatuses;
  } else {
    log.info('No updates found');
  }
  healthcheck.pingSuccess();
}

//schedule a check every so often
cron.schedule('*/5 * * * *', checkAndUpdate, {});

//do one check immediately, so if we fix something and restart the script, we dont have to wait
checkAndUpdate();
