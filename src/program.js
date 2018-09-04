const program = require('commander');
const pkg = require('../package.json');

program
	.version(pkg.version)
	.usage('[options]')
	.option('-i, --issue [n]', 'Begin work on a specific issue')
	.option('--sync-labels', 'Sync custom default labels to GitHub')
	.option('--remove-labels', 'Remove GitHub default labels')
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

module.exports = args;
