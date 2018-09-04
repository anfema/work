const execa = require('execa');
const { trim } = require('lodash');

module.exports = async () => {
	const { stdout } = await execa('git', ['branch', '-a', '--no-color']);

	const branches = stdout.split('\n').reduce(
		(acc, branch) => {
			branch = trim(branch);

			if (branch.substring(0, 2) === '* ') {
				acc.current = branch.substring(2);
				acc.local.push(acc.current);
			} else if (branch.match(/^remotes\//)) {
				acc.remote.push(branch.substring(8));
			} else {
				acc.local.push(branch);
			}

			return acc;
		},
		{
			current: undefined,
			local: [],
			remote: [],
		}
	);

	return branches;
};
