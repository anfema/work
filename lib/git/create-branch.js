const chalk = require('chalk');
const execa = require('execa');
const { kebabCase } = require('lodash');

const octokit = require('../octokit.js');
const gitStatus = require('./status.js');
const branchList = require('./branch-list.js');

const buildBranchName = (branchFormat, { username, number, title }) => {
	let branchName = branchFormat || '';

	branchName = branchName.replace('[USERNAME]', username);
	branchName = branchName.replace('[ISSUEID]', number);
	branchName = branchName.replace('[DESCRIPTION]', title);

	return branchName;
};

module.exports = async ({ owner, repo, issue: number, username, branchFormat, defaultBranch }) => {
	let branchName;

	try {
		const res = await octokit.issues.get({ owner, repo, number });
		const issue = res.data;

		console.log(`${chalk.cyan(`#${number} ${issue.title}`)}\n`);

		branchName = buildBranchName(branchFormat, {
			username,
			number,
			title: kebabCase(issue.title),
		});
	} catch (err) {
		console.error(err);
	}

	if (!branchName) {
		console.error(chalk.red(`Unable to build branch name`));

		process.exitCode = 1;

		return;
	}

	try {
		await execa('git', ['fetch']);
	} catch (err) {
		console.error(chalk.red('Error fetching'), err);

		return;
	}

	const status = await gitStatus();

	if (status.local === branchName) {
		console.log(chalk.blue('Already there.'));

		return;
	}

	if (status.local !== defaultBranch && status.clean === false) {
		console.error(
			chalk.yellow(
				`\nCan't create branch. You are on <${status.local}> and have ${
					status.files.length
				} modified file${status.files.length === 1 ? '' : 's'}: ${chalk.reset(
					status.files.map(line => `\n${line.state} ${line.file}`)
				)}\n`
			)
		);

		process.exitCode = 1;

		return;
	}

	const branches = await branchList();

	if (branches.local.includes(branchName)) {
		console.log(chalk.yellow(`${branchName} already exists. Please continue manually`));

		process.exitCode = 0;

		return;
	}

	try {
		await execa('git', ['checkout', '-b', branchName]);
		await execa('git', ['push', '--set-upstream']);
	} catch (err) {
		console.error(chalk.red(`Error creating branch`), err);
	}
};
