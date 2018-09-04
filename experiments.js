const createChangelog = require('./src/create-changelog.js');
const { owner, repo } = require('./lib/git/github-info.js');

(async () => {
	await createChangelog({
		tagFrom: '1.0.0',
		owner,
		repo,
		changelog: {
			'New Features & Improvements': ['Enhancement', 'Feature'],
			'Behind the scenes': ['Refactor'],
			'Fixed Bugs': ['Bug'],
			'Other changes': ['Chore'],
		},
	});
})();
