const rc = require('rc');

const defaults = require('./defaults.js');

const config = rc('work', defaults);

module.exports = config;
