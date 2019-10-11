const program = require('commander');
const pkg = require('../package.json');
const defaults = require('./defaults.js');

program
	.version(pkg.version)
	.usage('[options]')
	.option('-i, --issue [n]', 'Begin work on a specific issue')
	.option('-c, --changelog [t..t]', 'Render a changelog from Pull Requests')
	.option('-p, --pullrequest [branch]', 'Create Pull Request to given branch')
	.option('--sync-labels', 'Sync custom default labels to GitHub')
	.option('--remove-labels', 'Remove GitHub default labels')
	.option('--reset-config', 'Clears any configuration made (token, username, etc)')
	.parse(process.argv);

const args = {
	task: undefined,
	issue: undefined,
};

if (program.issue) {
	args.task = 'branch';

	if (program.issue !== true) {
		args.issue = program.issue;
	}
}

if (program.pullrequest) {
	args.task = 'pr';

	if (typeof program.pullrequest === 'string') {
		args.baseBranch = program.pullrequest;
	}
}

if (program.syncLabels) {
	args.task = 'gh-sync-custom-labels';
}

if (program.removeLabels) {
	args.task = 'gh-remove-default-labels';
}

if (program.resetConfig) {
	args.task = 'reset-config';
}

if (program.changelog === true || typeof program.changelog === 'string') {
	args.task = 'changelog';

	if (typeof program.changelog === 'string') {
		const [tagFrom, tagTo] = program.changelog.split('..');

		args.tagFrom = tagFrom;
		args.tagTo = tagTo;
	}

	args.tagFrom = args.tagFrom || defaults.tagFrom;
	args.tagTo = args.tagTo || defaults.tagTo;
}

module.exports = args;
