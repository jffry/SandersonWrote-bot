const fs = require('fs');
const STATE_FILE = 'data/state.json';

exports.saveStateMap = function (map) {
  let entries = Array.from(map.entries());
  let json = JSON.stringify(entries);
  fs.writeFileSync(STATE_FILE, json);
}

exports.loadStateMap = function () {
  if (fs.existsSync(STATE_FILE)) {
    let json = fs.readFileSync(STATE_FILE).toString();
    let entries = JSON.parse(json);
    return new Map(entries);
  } else {
    return new Map();
  }
}
