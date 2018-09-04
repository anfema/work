const gitCommits = require('git-commits');
const getStream = require('get-stream');

const commits = async (options = { cwd: '.' }) => {
	const commitStream = gitCommits(options.cwd, {});

	return getStream.array(commitStream);
};

module.exports = {
	commits,
};
