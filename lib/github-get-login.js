const config = require('../../src/config.js');
const octokit = require('../octokit.js');

module.exports = async () => {
	if (!config.get('login')) {
		const user = await octokit.users.get({});

		config.set('login', user.data.login);
	}

	return config.get('login');
};
