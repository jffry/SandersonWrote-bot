const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');
const request = require('./request');
const log = require('./log').withPrefix('[scrape]');

exports.parseStatuses = function (html) {
  const dom = htmlparser2.parseDOM(html);
  const $ = cheerio.load(dom);
  let labels = $('.vc_progress_bar .vc_label');
  let statuses = new Map();
  labels.each((i, elt) => {
    let $label = $(elt).clone();
    let $status = $label.find('.vc_label_units');
    let status = $status.text().trim();
    $status.remove(); //to exclude it from parent $label's text contents
    let label = $label.text().trim();
    statuses.set(label, status);
  });
  return statuses;
};

exports.getStatuses = function () {
  //about page contains the progress bars but not much else,
  //which makes it faster to load and parse, and hopefully also
  //less of a load on Brandon's server
  return request
    .get('https://www.brandonsanderson.com/about-brandon/')
    .then(exports.parseStatuses);
};

/*
Produces a simple object that describes what keys changed between two Maps
such as the ones produced by parseStatuses

Returned object looks like:
{
  added: [ { label: 'added', priorStatus: null, currentStatus: '10%' } ],
  changed: [ { label: 'changed', priorStatus: '50%', currentStatus: '60%' } ],
  removed: [ { label: 'removed', priorStatus: '100%', currentStatus: null } ],
  unchanged: [ { label: 'unchanged', priorStatus: '40%', currentStatus: '40%' } ]
}
*/
exports.diffStatuses = function (priorMap, currentMap) {
  let diff = {
    added: [],
    changed: [],
    removed: [],
    unchanged: []
  };
  for (const [label, currentStatus] of currentMap) {
    let item = {
      label: label,
      priorStatus: null,
      currentStatus: currentStatus
    };
    if (priorMap.has(label)) {
      item.priorStatus = priorMap.get(label);
      if (item.priorStatus === item.currentStatus) {
        diff.unchanged.push(item);
      } else {
        diff.changed.push(item);
      }
    } else {
      diff.added.push(item);
    }
  }
  for (const [label, priorStatus] of priorMap) {
    if (!currentMap.has(label)) {
      diff.removed.push({
        label: label,
        priorStatus: priorStatus,
        currentStatus: null
      });
    }
  }
  return diff;
};

// TODO: Truncate label so that an individual item description does not exceed the length
// of a Tweet.  We'd rather truncate the label, and have the status info fully visible.
// By default Twitter would truncate from the end and that's not ideal.

function describeItemAdded(item) {
  return `[New!] ${item.label || '?'}: ${item.currentStatus || '?'}`;
}

function describeItemChanged(item) {
  return `[Updated]️ ${item.label || '?'}: ${item.priorStatus || '?'} → ${item.currentStatus || '?'}`;
}

function describeItemRemoved(item) {
  return `[Removed] ${item.label || '?'} (was ${item.priorStatus || '?'})`;
}

/*
Produces an array of human-readable strings describing the changes in
a comparison like that produced by diffStatuses() above
*/
exports.humanReadableDiff = function (diff) {
  return [
    ...diff.added.map(describeItemAdded),
    ...diff.changed.map(describeItemChanged),
    ...diff.removed.map(describeItemRemoved),
  ];
};
