const gitRepoName = require('git-repo-name');
const gitUsername = require('git-username');

module.exports = (() => {
	try {
		return {
			repo: gitRepoName.sync(),
			owner: gitUsername(),
		};
	} catch (err) {
		return {};
	}
})();
