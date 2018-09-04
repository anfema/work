const Github = require('@octokit/rest');
const config = require('../src/config.js');

module.exports = () => {
	const github = new Github();

	github.authenticate({
		type: 'token',
		token: config.get('token'),
	});

	return github;
};
