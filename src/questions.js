const { sortBy } = require('lodash');
const chalk = require('chalk');
const inquirer = require('inquirer');
const termSize = require('term-size');

const config = require('./config.js');
const settings = require('./settings.js');
const octokit = require('../lib/octokit.js');
const githubLogin = require('../lib/github/get-login.js');

const ask = async ({ owner, repo }, program) => {
	if (!owner || !repo) {
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
				'\nWork did not find your Personal access token for GitHub. \nYou can aquire one on here: https://github.com/settings/tokens\n'
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
				message: 'Please enter your username',
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
						name: `Create a branch for an issue`,
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

	if (results.task === 'branch' && program.issue === undefined) {
		const answers = await inquirer.prompt([
			{
				name: 'issue',
				message: `Which issue should be worked on? ${chalk.dim(
					'Leave empty to select from open'
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
						const issues = await octokit().issues.getForRepo({
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

	results = Object.assign({}, program, results);

	return results;
};

module.exports = ask;
