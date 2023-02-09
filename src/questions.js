const { sortBy } = require('lodash');
const chalk = require('chalk');
const inquirer = require('inquirer');
const termSize = require('term-size');

const defaults = require('./defaults.js');
const config = require('./config.js');
const settings = require('./settings.js');
const octokit = require('../lib/octokit.js');
const githubLogin = require('../lib/github/get-login.js');
const versionTags = require('../lib/git/version-tags.js');
const branchList = require('../lib/git/branch-list.js');

const ask = async ({ owner, repo }, program) => {
	if (!owner) {
		console.log(
			chalk.red(`${process.cwd()} doesn't originate from a GitHub based repository.\n`)
		);

		process.exitCode = 1;

		return;
	}

	let results = {};

	if (config.get('token') === '') {
		console.log(
			chalk.yellow(
				'\nWork did not find your Personal access token for GitHub. \nYou can acquire one on here: https://github.com/settings/tokens\n'
			)
		);

		const answers = await inquirer.prompt([
			{
				name: 'token',
				message: 'Please enter your Personal access token',
				type: 'input',
				validate(value) {
					return value.trim() !== '';
				},
				filter(value) {
					return value.trim();
				},
			},
		]);

		config.set('token', answers.token);
	}

	const login = await githubLogin();

	if (settings.branchFormat.includes('[USERNAME]') && config.get('username') === '') {
		const answers = await inquirer.prompt([
			{
				name: 'username',
				message: 'Please enter your username (used for ticket-prefix)',
				type: 'input',
				default: login,
				validate(value) {
					return value.trim() !== '';
				},
				filter(value) {
					return value.trim();
				},
			},
		]);

		config.set('username', answers.username);

		results = Object.assign(results, answers);
	}

	if (process.stdout.isTTY) {
		console.log(
			chalk.dim(
				`\nHello ${config.get('username') || login}\nYou're working on ${owner}/${repo}!\n`
			)
		);
	}

	if (!program.task) {
		const answers = await inquirer.prompt([
			{
				name: 'task',
				message: `What do you want to do?`,
				type: 'list',
				default: 'branch',
				pageSize: 10,
				choices: [
					new inquirer.Separator(`--- ${owner}/${repo}: Work ---`),
					{
						name: `Create a branch for an issue ${chalk.red(
							'(From the current active branch!)'
						)}`,
						value: 'branch',
					},
					{
						name: `Create a pull request for the current branch`,
						value: 'pr',
					},
					{
						name: `Generate release notes`,
						value: 'changelog',
					},
					new inquirer.Separator(`--- ${owner}/${repo}: GitHub Settings ---`),
					{
						name: `Remove GitHub default labels`,
						value: 'gh-remove-default-labels',
					},
					{
						name: `Sync custom default labels`,
						value: 'gh-sync-custom-labels',
					},
				],
			},
		]);

		results = Object.assign(results, answers);
	} else {
		results.task = program.task;
	}

	if (results.task === 'gh-remove-default-labels') {
		const answers = await inquirer.prompt([
			{
				name: 'removeDefaultLabels',
				message: `Do you want to remove all default labels from this GitHub-Repo? ${chalk.dim(
					'Please confirm:'
				)}`,
				type: 'confirm',
				default: false,
			},
		]);

		if (!answers.removeDefaultLabels) {
			results.task = null;
		}

		results = Object.assign(results, answers);
	}

	if (results.task === 'gh-sync-custom-labels') {
		const answers = await inquirer.prompt([
			{
				name: 'syncCustomLabels',
				message: `Do you want to sync anfema-custom labels to this GitHub-Repo? ${chalk.dim(
					'Please confirm:'
				)}`,
				type: 'confirm',
				default: false,
			},
		]);

		if (!answers.syncCustomLabels) {
			results.task = null;
		}

		results = Object.assign(results, answers);
	}

	if (results.task === 'pr') {
		const branches = await branchList();
		const branchSelection = [];
		const remoteBranches = branches.remote.filter(ele => ele != `origin/${branches.current}`);

		program.headBranch = branches.current;
		remoteBranches.forEach(item => {
			if (!item.includes('origin/HEAD ->')) {
				branchSelection.push(item.replace('origin/', ''));
			}
		}); // clean branchlist and remove local branch from remote-branchlist

		const answers = await inquirer.prompt([
			{
				name: 'baseBranch',
				message: `Which base-branch you want your changes pulled into? ${chalk.dim(
					'Leave empty to select from remote branches'
				)}`,
				type: 'input',
				filter(value) {
					return `${value}`.match(/\s/) ? '' : value;
				},
				when() {
					return program.baseBranch === undefined;
				},
			},
			{
				name: 'baseBranch',
				message: 'Please select base-branch:',
				type: 'list',
				pageSize: Math.max(termSize().rows - 7, 5),
				choices: async () => {
					return branchSelection;
				},
				when(currentAnswers) {
					return currentAnswers.baseBranch === '';
				},
			},
			{
				name: 'createDraftPullRequest',
				message: `Is this new pull request a draft? ${chalk.dim('Please confirm:')}`,
				type: 'confirm',
				default: false,
				when(currentAnswers) {
					return currentAnswers.baseBranch;
				},
			},
		]);

		results = Object.assign(results, answers);
	}

	if (results.task === 'branch' && program.issue === undefined) {
		const answers = await inquirer.prompt([
			{
				name: 'issue',
				message: `Which issue should be worked on? ${chalk.dim(
					'Leave empty to select from open'
				)} ${chalk.red(
					'(Please Note: The new branch will be based on the currently active branch!)'
				)}`,
				type: 'input',
				filter(value) {
					return `${value}`.match(/\d+/) ? value : '';
				},
				when() {
					return program.task === undefined;
				},
			},
			{
				name: 'issue',
				message: 'Which issue do you want to work on?',
				type: 'list',
				pageSize: Math.max(termSize().rows - 7, 5),
				choices: async () => {
					try {
						const issues = await octokit().issues.listForRepo({
							owner,
							repo,
							state: 'open',
							sort: 'updated',
							direction: 'desc',
							per_page: 100,
							page: 1,
						});

						const issuesByAssignee = issues.data.reduce(
							(acc, issue) => {
								if (issue.pull_request) {
									return acc;
								}

								const isAssignedToUser = issue.assignees.find(
									assignee => assignee.login === login
								);

								if (isAssignedToUser) {
									acc.own.push({
										name: `${chalk.dim(`#${issue.number}:`)} ${issue.title}`,
										value: issue.number,
										short: issue.number,
									});
								} else {
									acc.other.push({
										name: `${chalk.dim(`#${issue.number}:`)} ${issue.title}${
											issue.assignees[0]
												? chalk.cyan.dim(` (@${issue.assignees[0].login})`)
												: ''
										}`,
										value: issue.number,
										short: issue.number,
									});
								}

								return acc;
							},
							{ own: [], other: [] }
						);

						return [
							new inquirer.Separator('--- Your tickets ---'),
							...sortBy(issuesByAssignee.own, 'value').reverse(),
							new inquirer.Separator('--- Other tickets ---'),
							...sortBy(issuesByAssignee.other, 'value').reverse(),
						];
					} catch (err) {
						console.error(
							chalk.red(`Error requesting GitHub issues for ${owner}/${repo}`, err)
						);

						process.exitCode = 1;

						return [];
					}
				},

				when(currentAnswers) {
					return (
						(results.task === 'branch' && currentAnswers.issue === '') ||
						(program.task === 'branch' && program.issue === undefined)
					);
				},
			},
		]);

		results = Object.assign(results, answers);
	}

	if (results.task === 'changelog') {
		const versions = await versionTags();

		const answers = await inquirer.prompt([
			{
				name: 'tagFrom',
				message: 'From where should the changelog start?',
				type: 'list',
				pageSize: Math.max(termSize().rows - 7, 5),
				default: versions[0] || defaults.tagFrom,
				choices: async () => {
					return [
						...versions,
						{
							name: 'Initial commit',
							value: defaults.tagFrom,
							short: 'Initial',
						},
					];
				},
				when() {
					return program.tagFrom === undefined;
				},
			},
			{
				name: 'tagTo',
				message: 'Where should the changelog end?',
				type: 'list',
				pageSize: Math.max(termSize().rows - 8, 5),
				default: defaults.tagTo,
				choices: async currentAnswers => {
					const remainingVersions = versions.slice(
						0,
						versions.indexOf(currentAnswers.tagFrom)
					);

					return [
						{
							name: 'Current Head',
							value: defaults.tagTo,
							short: 'HEAD',
						},
						...remainingVersions,
					];
				},
				when() {
					return program.tagTo === undefined;
				},
			},
		]);

		results = Object.assign(results, answers);
	}

	results = Object.assign({}, program, results);

	return results;
};

module.exports = ask;
