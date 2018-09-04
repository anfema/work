const chalk = require('chalk');

const gitCreateBranch = require('./lib/git/create-branch.js');
const githubInfo = require('./lib/git/github-info.js');
const program = require('./src/program.js');
const questions = require('./src/questions.js');
const config = require('./src/config.js');
const settings = require('./src/settings.js');
const createLabels = require('./lib/github/create-labels.js');
const deleteLabels = require('./lib/github/delete-labels.js');

(async () => {
	try {
		const answers = await questions(githubInfo, program);
		const results = Object.assign({}, config.store, settings, githubInfo, answers);

		switch (results.task) {
			case 'branch':
				await gitCreateBranch(results);

				break;

			case 'pr':
				console.log(chalk.blue(`Pull Requests are not implemented yet`));

				break;

			case 'changelog':
				console.log(chalk.blue(`Changelogs are not implemented yet`));

				break;

			case 'gh-remove-default-labels':
				await deleteLabels(results);

				break;

			case 'gh-sync-custom-labels':
				await createLabels(results);

				break;

			default:
				break;
		}
	} catch (err) {
		console.error(err);
	}
})();
