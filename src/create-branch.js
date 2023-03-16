const chalk = require('chalk');
const execa = require('execa');
const ora = require('ora');
const { kebabCase } = require('lodash');

const octokit = require('../lib/octokit.js');
const gitStatus = require('../lib/git/status.js');
const branchList = require('../lib/git/branch-list.js');

const buildBranchName = (branchFormat, { username, number, title }) => {
	let branchName = branchFormat || '';

	branchName = branchName.replace('[USERNAME]', username);
	branchName = branchName.replace('[ISSUEID]', number);
	branchName = branchName.replace('[DESCRIPTION]', title);

	return branchName;
};

module.exports = async ({ owner, repo, issue: number, username, branchFormat }) => {
	const spinner = ora('Creating branch…').start();

	try {
		spinner.text = `Fetching commits from origin`;

		await execa('git', ['fetch']);
	} catch (err) {
		spinner.fail('Error fetching from GitHub');
		console.error(err);

		return;
	}

	spinner.text = `Checking git status`;

	const status = await gitStatus();

	let branchName;

	try {
		spinner.text = `Downloading issue data from GitHub`;

		const res = await octokit().issues.get({ owner, repo, number });
		const issue = res.data;

		spinner.text = `Found data for ${chalk.cyan(`#${number} ${issue.title}`)}`;

		branchName = buildBranchName(branchFormat, {
			username,
			number,
			title: kebabCase(issue.title),
		});
	} catch (err) {
		console.error(err);
	}

	if (!branchName) {
		spinner.fail(`Unable to build branch name`);

		process.exitCode = 1;

		return;
	}

	if (status.local === branchName) {
		spinner.info(`Already there.`);

		return;
	}

	// if (status.clean === false) {
	// 	spinner.fail(
	// 		`Can't create branch. The current Branch you are on (${chalk.blue(status.local)}) has ${
	// 			status.files.length
	// 		} modified file${status.files.length === 1 ? '' : 's'}: ${chalk.reset(
	// 			status.files.map(line => `\n${line.state} ${line.file}`)
	// 		)}`
	// 	);

	// 	process.exitCode = 1;

	// 	return;
	// }

	spinner.text = `Checking branches`;

	const branches = await branchList();

	if (branches.local.includes(branchName)) {
		spinner.warn(`${branchName} already exists. \nPlease continue manually`);

		process.exitCode = 0;

		return;
	}

	try {
		// spinner.text = `Switching to ${chalk.blue(`develop`)}`;

		// await execa('git', ['checkout', 'develop']);

		// spinner.text = `Creating ${chalk.blue(`develop`)}`;

		spinner.text = `Checking out the current branch ${chalk.blue(status.local)}`;

		await execa('git', ['checkout', '-b', branchName, status.local]);

		spinner.text = `Syncing to GitHub`;

		await execa('git', ['push', '--set-upstream']);

		spinner.succeed(
			`You're now on ${chalk.green(branchName)} based from ${chalk.blue(status.local)}`
		);
	} catch (err) {
		console.error(chalk.red(`Error creating branch`), err);
	}
};
