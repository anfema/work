const execa = require('execa');
const { trim } = require('lodash');

const gitStatus = async () => {
	const { stdout } = await execa('git', ['status', '--porcelain', '-b']);

	const status = {
		local: null,
		remote: null,
		clean: true,
		files: [],
	};

	const lines = stdout.split('\n');
	const branches = lines
		.shift()
		.replace(/\#\#\s+/, '')
		.split('...');

	status.local = branches[0];

	if (branches[1]) {
		status.remote = branches[1];
	}

	status.files = lines.reduce((acc, line) => {
		if (!line) {
			return acc;
		}

		line = trim(line);

		const [state, ...file] = line.split(' ');

		acc.push({
			file: file.join(' '),
			state,
		});

		return acc;
	}, []);

	status.clean = status.files.length === 0;

	return status;
};

module.exports = gitStatus;
