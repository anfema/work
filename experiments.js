// const listPullRequests = require('./src/list-pull-requests.js');
// const renderChangeLog = require('./src/render-change-log.js');

// const { last: lastTag, all: allTags } = require('./lib/repository-tags.js');
const repoPath = require('./lib/repository-path.js');

const { commits } = require('./lib/commits.js');

// const inquirer = require('inquirer');

// const config = require('./src/config.js');

(async () => {
	// const pullRequests = await listPullRequests();
	// const lastRelease = await lastTag({ cwd: repoPath });
	//
	// const tags = await allTags({ cwd: repoPath });
	//

	console.log(repoPath);

	// const changeLog = renderChangeLog(pullRequests);
	//
	// console.log(lastRelease);
	// gitCommits(repoPath, {}).on('data', commit => {
	// 	console.log(commit.hash, commit.hash === lastRelease.hash);
	// });
	//

	const all = await commits({
		cwd: repoPath,
	});

	console.log(
		all.map(
			commit =>
				`${commit.hash.substr(0, 6)} ${commit.title.trim()} ${commit.description
					.split('\n')
					.join('')
					.trim()}`
		)
	);

	// console.log(
	// 	pullRequests.map(pr => pr.data.merge_commit_sha)
	// 	// .map(sha => `${sha}: ${sha === lastRelease.hash}`)
	// );
	//
	// let answers = await inquirer.prompt([
	// 	{
	// 		type: 'list',
	// 		name: 'run',
	// 		message: 'What do you want to do today?',
	// 		default: 'list',
	// 		choices: [
	// 			{
	// 				name: 'List available releases',
	// 				value: 'list',
	// 				short: 'List releases',
	// 			},
	// 			{
	// 				name: 'Create new release',
	// 				value: 'new',
	// 				short: 'New release',
	// 			},
	// 			new inquirer.Separator(),
	// 			{
	// 				name: "Quit",
	// 				value: 'quit',
	// 			},
	// 		],
	// 		when(answers) {
	// 			if (answers.continue || answers.list) {
	// 				return true;
	// 			}
	// 		}
	// 	},
	// ]);
	// if (answers.run === 'list') {
	// 	const tagsStream = repositoryTags({ cwd: repoPath });
	// 	const tags = await getStream.array(tagsStream);
	// 	console.log(tags.map(({ tag, hash }) => `${tag} (${hash})`).join('\n'), '\n');
	// 	answers = await promtStart();
	// }
	// if (answers.run === 'new') {
	// 	answers = await inquirer.prompt([
	// 		{
	// 			type: 'list',
	// 			name: 'release',
	// 			message: 'What kind of ?',
	// 			default: 'list',
	// 			choices: [
	// 				{
	// 					name: 'Major',
	// 					value: 'major',
	// 					short: 'List releases',
	// 				},
	// 				new inquirer.Separator(),
	// 				{
	// 					name: "Quit",
	// 					value: 'quit',
	// 				},
	// 			],
	// 		},
	// 	]);
	// }
})();
