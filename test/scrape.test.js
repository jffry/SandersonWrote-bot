const {assert} = require('chai');
const {describe, it} = require('mocha');

const scrape = require('../src/scrape');

/*
this HTML is a very very simplified subset of https://www.brandonsanderson.com/about-brandon/
retrieved on 2020-08-11.  It's used to test the parsing logic in a repeatable fashion.
*/
const HTML_BARS_PRESENT = `
<html lang="en-US">
 <head>
  <meta charset="UTF-8" />
  <title>About Brandon | Brandon Sanderson</title>
 </head>
 <body>
  <h3 style="color: #ced0d6;text-align: left" class="vc_custom_heading">PROGRESS BARS</h3>
  <!-- ... -->
  <div class="vc_progress_bar wpb_content_element pb-style-two transparent-bg dt-style">
   <small class="vc_label" style="color:#ced0d6;">Stormlight 4 Draft 5.0 <span class="vc_label_units">100%</span></small>
   <div class="vc_general vc_single_bar">
    <span class="vc_bar " data-percentage-value="100" data-value="100" style="background-color:#ced0d6;"></span>
   </div>
   <small class="vc_label" style="color:#ced0d6;">Songs of the Dead Revision <span class="vc_label_units">100%</span></small>
   <div class="vc_general vc_single_bar">
    <span class="vc_bar " data-percentage-value="100" data-value="100" style="background-color:#ced0d6;"></span>
   </div>
   <small class="vc_label" style="color:#ced0d6;">Rhythm of War (Stormlight 4) copyediting review <span class="vc_label_units">100%</span></small>
   <div class="vc_general vc_single_bar">
    <span class="vc_bar " data-percentage-value="100" data-value="100" style="background-color:#ced0d6;"></span>
   </div>
   <small class="vc_label" style="color:#ced0d6;">Dawnshard Novella <span class="vc_label_units">20%</span></small>
   <div class="vc_general vc_single_bar">
    <span class="vc_bar " data-percentage-value="20" data-value="20" style="background-color:#ced0d6;"></span>
   </div>
  </div>
  <!-- ... -->
 </body>
</html>
`;

/*
I've never seen them duplicated but we should do the "right" thing if they are,
and use the latter value
*/
const HTML_BARS_DUPLICATED = `
<html lang="en-US">
 <head>
  <meta charset="UTF-8" />
  <title>About Brandon | Brandon Sanderson</title>
 </head>
 <body>
  <h3 style="color: #ced0d6;text-align: left" class="vc_custom_heading">PROGRESS BARS</h3>
  <!-- ... -->
  <div class="vc_progress_bar wpb_content_element pb-style-two transparent-bg dt-style">
   <small class="vc_label" style="color:#ced0d6;">Duplicated Thing <span class="vc_label_units">50%</span></small>
   <div class="vc_general vc_single_bar">
    <span class="vc_bar " data-percentage-value="100" data-value="100" style="background-color:#ced0d6;"></span>
   </div>
   <small class="vc_label" style="color:#ced0d6;">Duplicated Thing <span class="vc_label_units">100%</span></small>
   <div class="vc_general vc_single_bar">
    <span class="vc_bar " data-percentage-value="100" data-value="100" style="background-color:#ced0d6;"></span>
   </div>
  </div>
  <!-- ... -->
 </body>
</html>
`;

const HTML_BARS_MISSING = `
<html lang="en-US">
 <head>
  <meta charset="UTF-8" />
  <title>About Brandon | Brandon Sanderson</title>
 </head>
 <body>
  <!-- ... -->
 </body>
</html>
`;


describe('scrape.parseStatuses()', () => {
  it('works when progress bars are present', () => {
    let expected = new Map([
      ['Stormlight 4 Draft 5.0', '100%'],
      ['Songs of the Dead Revision', '100%'],
      ['Rhythm of War (Stormlight 4) copyediting review', '100%'],
      ['Dawnshard Novella', '20%'],
    ]);
    let actual = scrape.parseStatuses(HTML_BARS_PRESENT);
    assert.deepEqual(actual, expected);
  });
  it('takes the last value when bars are duplicated', () => {
    let expected = new Map([
      ['Duplicated Thing', '100%'],
    ]);
    let actual = scrape.parseStatuses(HTML_BARS_DUPLICATED);
    assert.deepEqual(actual, expected);
  });
  it('works when progress bars are missing', () => {
    let expected = new Map();
    let actual = scrape.parseStatuses(HTML_BARS_MISSING);
    assert.deepEqual(actual, expected);
  });
});

describe('scrape.diffStatuses()', () => {
  it('works with empty maps', () => {
    let prior = new Map();
    let current = new Map();
    let expected = {
      added: [],
      changed: [],
      removed: [],
      unchanged: []
    };
    let actual = scrape.diffStatuses(prior, current);
    assert.deepEqual(actual, expected);
  });
  it('detects a simple addition', () => {
    let prior = new Map();
    let current = new Map([['added', '10%']]);
    let expected = {
      added: [{label: 'added', priorStatus: null, currentStatus: '10%'}],
      changed: [],
      removed: [],
      unchanged: []
    };
    let actual = scrape.diffStatuses(prior, current);
    assert.deepEqual(actual, expected);
  });
  it('detects a simple removal', () => {
    let prior = new Map([['removed', '100%']]);
    let current = new Map();
    let expected = {
      added: [],
      changed: [],
      removed: [{label: 'removed', priorStatus: '100%', currentStatus: null}],
      unchanged: []
    };
    let actual = scrape.diffStatuses(prior, current);
    assert.deepEqual(actual, expected);
  });
  it('detects a simple change', () => {
    let prior = new Map([['changed', '50%']]);
    let current = new Map([['changed', '60%']]);
    let expected = {
      added: [],
      changed: [{label: 'changed', priorStatus: '50%', currentStatus: '60%'}],
      removed: [],
      unchanged: []
    };
    let actual = scrape.diffStatuses(prior, current);
    assert.deepEqual(actual, expected);
  });
  it('detects a simple non-change', () => {
    let prior = new Map([['unchanged', '40%']]);
    let current = new Map([['unchanged', '40%']]);
    let expected = {
      added: [],
      changed: [],
      removed: [],
      unchanged: [{label: 'unchanged', priorStatus: '40%', currentStatus: '40%'}]
    };
    let actual = scrape.diffStatuses(prior, current);
    assert.deepEqual(actual, expected);
  });
  it('works with a complicated scenario', function () {
    let prior = new Map([
      ['removed', '100%'],
      ['changed', '50%'],
      ['unchanged', '40%'],
    ]);
    let current = new Map([
      ['added', '10%'],
      ['added-null', null],
      ['changed', '60%'],
      ['unchanged', '40%'],
    ]);
    let expected = {
      added: [
        {label: 'added', priorStatus: null, currentStatus: '10%'},
        {label: 'added-null', priorStatus: null, currentStatus: null}
      ],
      changed: [{label: 'changed', priorStatus: '50%', currentStatus: '60%'}],
      removed: [{label: 'removed', priorStatus: '100%', currentStatus: null}],
      unchanged: [{label: 'unchanged', priorStatus: '40%', currentStatus: '40%'}]
    };
    let actual = scrape.diffStatuses(prior, current);
    assert.deepEqual(actual, expected);
  });
});

describe('scrape.humanReadableDiff()', () => {
  //something which could be added, changed, OR removed
  let sampleItem = {label: 'foo', priorStatus: '10%', currentStatus: '20%'};

  function emptyDiff() {
    return {
      added: [],
      changed: [],
      removed: [],
      unchanged: []
    };
  }

  it('has no lines when diff is empty', () => {
    let diff = emptyDiff();
    let lines = scrape.humanReadableDiff(diff);
    assert.lengthOf(lines, 0);
  });
  describe('unchanged items', () => {
    it('ignores unchanged items, otherwise empty', () => {
      let diff = emptyDiff();
      diff.unchanged.push(sampleItem);
      let lines = scrape.humanReadableDiff(diff);
      assert.lengthOf(lines, 0);
    });
    it('ignores unchanged items, but respects other items', () => {
      let diff = emptyDiff();
      diff.unchanged.push(sampleItem);
      diff.added.push(sampleItem);
      let lines = scrape.humanReadableDiff(diff);
      assert.lengthOf(lines, 1);
    });
  });
  describe('items all in one category', () => {
    for (let category of ['added', 'changed', 'removed']) {
      it(`has one line if only one item in "${category}" category`, () => {
        let diff = emptyDiff();
        diff[category].push(sampleItem);
        let lines = scrape.humanReadableDiff(diff);
        assert.lengthOf(lines, 1);
      });
      it(`has multiple lines, one per item in "${category}" category`, () => {
        let diff = emptyDiff();
        diff[category].push(sampleItem);
        diff[category].push(sampleItem);
        let lines = scrape.humanReadableDiff(diff);
        assert.lengthOf(lines, 2);
      });
    }
  });
  describe('items across categories', () => {
    it('has multiple lines if one item in each category', () => {
      let diff = emptyDiff();
      diff.added.push(sampleItem);
      diff.changed.push(sampleItem);
      diff.removed.push(sampleItem);
      let lines = scrape.humanReadableDiff(diff);
      assert.lengthOf(lines, 3);
    });
    it('has multiple lines with different numbers in each category', () => {
      let diff = emptyDiff();
      diff.added.push(sampleItem);
      diff.changed.push(sampleItem);
      diff.changed.push(sampleItem);
      let lines = scrape.humanReadableDiff(diff);
      assert.lengthOf(lines, 3);
    });
  });
});
