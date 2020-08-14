const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '../data/auth.json');

// Loads auth each time to make it easier to dynamically update to fix problems
exports.getAuth = function (name) {
  if (fs.existsSync(AUTH_FILE)) {
    let json = fs.readFileSync(AUTH_FILE).toString();
    let data = JSON.parse(json);
    return data[name];
  } else {
    return null;
  }
}
