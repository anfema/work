const Github = require('@octokit/rest');
const config = require('../src/config.js');

const github = new Github();

github.authenticate({
	type: 'token',
	token: config.get('token'),
});

module.exports = github;
