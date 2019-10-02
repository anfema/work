const chalk = require('chalk');

const config = require('./src/config.js');
const githubInfo = require('./lib/git/github-info.js');
const program = require('./src/program.js');
const questions = require('./src/questions.js');
const settings = require('./src/settings.js');

const createBranch = require('./src/create-branch.js');
const createChangelog = require('./src/create-changelog.js');
const createPullRequest = require('./src/create-pullrequest.js');
const createLabels = require('./src/create-labels.js');
const deleteLabels = require('./src/delete-labels.js');

(async () => {
	try {
		const answers = await questions(githubInfo, program);
		const results = Object.assign({}, config.store, settings, githubInfo, answers);

		switch (results.task) {
			case 'branch':
				await createBranch(results);

				break;

			case 'pr':
				await createPullRequest(results);

				break;

			case 'changelog':
				await createChangelog(results);

				break;

			case 'gh-remove-default-labels':
				await deleteLabels(results);

				break;

			case 'gh-sync-custom-labels':
				await createLabels(results);

				break;

			case 'reset-config':
				config.clear();

				break;

			default:
				break;
		}
	} catch (err) {
		console.error(err);
	}
})();
