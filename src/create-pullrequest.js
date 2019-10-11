const chalk = require('chalk');
const ora = require('ora');
const execa = require('execa');

const octokit = require('../lib/octokit.js');

const getTicketId = branch => {
	return new RegExp(/(?:\w.\w+)\/(\d+)/gims).exec(branch)[1];
};

const createLabels = labels => {
	const labelStrings = [];

	labels.forEach(label => {
		if (!label.name.includes('Status:')) {
			labelStrings.push(label.name);
		}
	});

	return labelStrings;
};

module.exports = async ({ owner, repo, baseBranch, headBranch }) => {
	const spinner = ora('Creating pull request...').start();
	const [base, head] = [baseBranch, headBranch];
	let number = getTicketId(headBranch);
	let title, body, labels, milestone;

	try {
		spinner.text = `Fetching information for ticket #${number}`;

		const res = await octokit().issues.get({ owner, repo, number });
		const issue = res.data;

		title = issue.title;
		body = `re #${number}`;
		labels = createLabels(issue.labels);
		milestone = issue.milestone && issue.milestone.number; // checks if 'issue.milestone' true -> outputs 'issue.milestone.number'
	} catch (err) {
		spinner.fail('Error fetching from GitHub');
		console.error(err);
	}

	if (!title || !body) {
		spinner.fail(`Unable to create pull request`);

		process.exitCode = 1;

		return;
	}

	try {
		spinner.text = 'Pushing changes to GitHub';

		await execa('git', ['push']);
	} catch (err) {
		spinner.fail('Error pushing to GitHub');
		console.error(err);

		return;
	}

	try {
		spinner.text = `Creating pull request for ticket ${chalk.cyan(`#${number} - ${title}`)}`;
		const res = await octokit().pullRequests.create({ owner, repo, title, head, base, body });

		spinner.info(`Pull request for ticket ${chalk.cyan(`#${number}`)} created`);

		number = res.data.number;
		prUrl = res.data.html_url;
	} catch (err) {
		spinner.fail('Unable to create pull request');
		console.error(err);
	}

	spinner.info(`Link to new pull request with id #${number}: ${chalk.cyan(`${prUrl}`)}`);

	try {
		spinner.text = 'Synchronizing labels and milestones to pull request';

		await octokit().issues.update({ owner, repo, number, milestone, labels });
	} catch (err) {
		spinner.fail('Unable to synchronize labels and milestones with new pull request');
		console.error(err);
	}

	spinner.succeed('Pull request opened successfully. We are done here!');
};
