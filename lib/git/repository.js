const path = require('path');
const config = require('./settings.js');

module.exports = path.join(config.cwd, '.git');
