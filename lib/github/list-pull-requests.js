const gitUsername = require('git-username');
const gitRepoName = require('git-repo-name');
const pify = require('pify');

const config = require('../../src/config.js');
const github = require('./github.js');

const gitRepoNameAsync = pify(gitRepoName);

module.exports = async function listPullrequests() {
	const owner = gitUsername(config.cwd);
	const repo = await gitRepoNameAsync(config.cwd);

	try {
		const closedPullRequests = await github.pullRequests.getAll({
			owner,
			repo,
			state: 'closed',
			base: 'develop',
			per_page: 100,
		});

		return closedPullRequests.data.map(data => {
			const { title } = data;

			try {
				const [, prefix, t] = title.trim().match(/^([A-Z]+)\:\s(.*)/);

				return { prefix: prefix.toLowerCase(), title: t, data };
			} catch (err) {
				return { prefix: 'misc', title, data };
			}
		});
	} catch (err) {
		console.error('Error', err);
	}
};
