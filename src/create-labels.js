const chalk = require('chalk');
const pEachSeries = require('p-each-series');

const octokit = require('../lib/octokit.js');

module.exports = async ({ owner, repo, defaultLabels }) => {
	pEachSeries(defaultLabels, async ({ name, color, description }) => {
		let payload = {};

		try {
			payload = {
				owner,
				repo,
				name,
				color: color.substring(0, 1) === '#' ? color.substring(1) : color,
			};

			if (description) {
				payload.description = description;
			}

			await octokit().issues.createLabel(payload);

			console.log(`Created "${name}"`);
		} catch (err) {
			if (err.code === 422) {
				try {
					payload.current_name = payload.name;

					delete payload.name;

					await octokit().issues.updateLabel(payload);

					console.log(`Updated "${name}"`);
				} catch (errUpdate) {
					console.log(errUpdate);
				}

				return;
			}

			console.log(err);
		}
	});

	console.log(chalk.blue(`Synced custom default labels to ${owner}/${repo}`));
};
