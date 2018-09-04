const chalk = require('chalk');
const pEachSeries = require('p-each-series');

const octokit = require('../octokit.js');
const timeout = require('../timeout.js');

module.exports = async ({ owner, repo, githubLabelstoDelete }) => {
	pEachSeries(githubLabelstoDelete, async name => {
		try {
			await timeout(500);
			await octokit.issues.deleteLabel({ owner, repo, name });
		} catch (err) {
			// Error 404 === Label didn't exist
			if (err.code !== 404) {
				console.log(err);
			}
		}

		console.log(`Removed "${name}".`);
	});

	console.log(chalk.blue(`Removed all GitHub default labels`));
};
