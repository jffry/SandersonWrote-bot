const {assert} = require('chai');
const {describe, it} = require('mocha');

const twitter = require('../src/twitter');

describe('twitter.chunkLinesIntoTweets()', () => {
  it('returns nothing if given nothing', () => {
    let lines = [];
    let actual = twitter.chunkLinesIntoTweets(lines, 10);
    let expected = [];
    assert.deepEqual(actual, expected);
  });
  it('returns line verbatim if given one line', () => {
    let lines = ['first'];
    let actual = twitter.chunkLinesIntoTweets(lines, 10);
    let expected = ['first'];
    assert.deepEqual(actual, expected);
  });
  it('returns first line verbatim if given one line, even if it exceeds max length', () => {
    let lines = ['longer than ten chars'];
    let actual = twitter.chunkLinesIntoTweets(lines, 10);
    let expected = ['longer than ten chars'];
    assert.deepEqual(actual, expected);
  });
  it('combines short lines into one message', () => {
    let lines = ['a', 'b', 'c'];
    let actual = twitter.chunkLinesIntoTweets(lines, 10);
    let expected = ['a\nb\nc'];
    assert.deepEqual(actual, expected);
  });
  it('handles empty lines just fine', () => {
    let lines = ['', '1', '', '2'];
    let actual = twitter.chunkLinesIntoTweets(lines, 10);
    let expected = ['\n1\n\n2'];
    assert.deepEqual(actual, expected);
  });
  it('creates multiple messages if the lines grow too long', () => {
    let lines = ['a', 'b', 'c', 'd'];
    let actual = twitter.chunkLinesIntoTweets(lines, 3);
    let expected = ['a\nb', 'c\nd'];
    assert.deepEqual(actual, expected);
  });
  it('places too-long lines into their own message undisturbed', () => {
    let lines = ['w', 'x', 'verylongline', 'y', 'z'];
    let actual = twitter.chunkLinesIntoTweets(lines, 4);
    let expected = ['w\nx', 'verylongline', 'y\nz'];
    assert.deepEqual(actual, expected);
  });
});