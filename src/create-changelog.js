const ProgressBar = require('progress');
const chalk = require('chalk');
const pMap = require('p-map');
const semver = require('semver');

const octokit = require('../lib/octokit.js');
const getCommits = require('../lib/git/get-commits.js');
const findPrId = require('../lib/git/find-pr-id.js');
const render = require('../lib/changelog/render.js');

const createChangelog = async ({
	tagFrom,
	tagTo,
	owner,
	repo,
	changelog: changelogCategories,
} = {}) => {
	try {
		console.log(
			chalk.green(
				`Rendering changelog from ${tagFrom ? tagFrom : 'Initial'}${
					tagTo ? ` to ${tagTo}` : ''
				}:`
			)
		);

		let commits = await getCommits({ from: tagFrom, to: tagTo || '' });

		commits = commits.reduce((acc, commit) => {
			const prId = findPrId(commit.summary);

			if (prId === null) {
				return acc;
			}

			let tags = [];

			if (commit.refName.length > 1) {
				const TAG_PREFIX = 'tag: ';

				tags = commit.refName
					.split(', ')
					.filter(ref => ref.startsWith(TAG_PREFIX))
					.map(ref => ref.substr(TAG_PREFIX.length));
			}

			acc.push({
				...commit,
				tags,
				number: prId,
			});

			return acc;
		}, []);

		const bar = new ProgressBar('Downloading Pull Request data from GitHub [:bar] (:percent)', {
			total: commits.length,
			complete: chalk.green('▪'),
			incomplete: chalk.enabled ? chalk.gray('▪') : '▫',
			width: 10,
			clear: true,
		});

		await pMap(
			commits,
			async commit => {
				try {
					const pr = await octokit().pullRequests.get({
						owner,
						repo,
						number: commit.number,
					});

					const referencedIssueIdMatch = pr.data.body.match(/Re:? ([#\d,\s]+)/);

					let issues = [];

					if (referencedIssueIdMatch && referencedIssueIdMatch[1]) {
						issues = referencedIssueIdMatch[1]
							.split(',')
							.map(id => id.trim().match(/\d+/)[0]);
					}

					bar.tick();

					delete commit.number;

					commit.pr = pr.data;
					commit.issues = issues;
				} catch (err) {
					bar.interrupt(`Error requesting PR #${commit.number}`);
				}
			},
			{ concurrency: 5 }
		);

		const versions = new Map();
		let currentVersion = tagTo || 'UNRELEASED';

		const makeVersion = () => {
			// Create data structure to sort commits into categories
			const categoriesByLabel = new Map();
			const categories = new Map();
			const relevantLabels = new Set();

			Object.entries(changelogCategories).forEach(([categoryTitle, labels]) => {
				labels = Array.isArray(labels) ? labels : [labels];

				let entries = categories.get(categoryTitle);

				if (!entries) {
					entries = new Set();

					categories.set(categoryTitle, entries);
				}

				labels.forEach(label => {
					categoriesByLabel.set(label, entries);
					relevantLabels.add(label);
				});
			});

			return {
				categoriesByLabel,
				categories,
				relevantLabels,
				commits: [],
			};
		};

		versions.set(currentVersion, makeVersion());

		// Sort commits into categories
		for (const commit of commits) {
			if (!commit || !commit.pr || !commit.pr.labels) {
				continue;
			}

			commit.otherLabels = commit.otherLabels || [];

			const [versionTag] = commit.tags.filter(tag => semver.valid(tag)).sort(semver.compare);

			if (versionTag) {
				currentVersion = versionTag;

				if (!versions.has(currentVersion)) {
					versions.set(currentVersion, makeVersion());
				}
			}

			const version = versions.get(currentVersion);

			commit.pr.labels.forEach(({ name: label }) => {
				if (version.relevantLabels.has(label)) {
					version.categoriesByLabel.get(label).add(commit);
				} else {
					commit.otherLabels.push(label);
				}
			});

			version.commits.push(commit);
		}

		const changelog = render(versions);

		console.log(changelog);
	} catch (err) {
		console.log(err);
	}
};

module.exports = createChangelog;
