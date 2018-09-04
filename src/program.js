const program = require('commander');
const pkg = require('../package.json');

program
	.version(pkg.version)
	.usage('[options]')
	.option('-i, --issue [n]', 'Begin work on a specific issue')
	.option('-c, --changelog [t..t]', 'Create changelog')
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

if (program.syncLabels) {
	args.task = 'gh-sync-custom-labels';
}

if (program.removeLabels) {
	args.task = 'gh-remove-default-labels';
}

if (program.resetConfig) {
	args.task = 'reset-config';
}

if (program.changelog) {
	args.task = 'changelog';

	let command = program.changelog;

	command = command === true ? '' : command;

	const range = command.split('..');
	const [tagFrom, tagTo] = range;

	if (tagFrom) {
		args.tagFrom = tagFrom;
	}

	if (tagTo) {
		args.tagTo = tagTo;
	}
}

module.exports = args;
