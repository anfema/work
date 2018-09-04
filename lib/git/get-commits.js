const execa = require('execa');

const commits = async ({ from = '', to = '' } = {}) => {
	to = to || 'HEAD';

	try {
		const args = ['log', '--oneline', '--pretty=%H;%D;%s;%cd', '--date=short'];

		if (from) {
			args.push(`${from}..${to}`);
		}

		const { stdout } = await execa('git', args);

		return stdout
			.split('\n')
			.filter(Boolean)
			.map(commit => {
				const parts = commit.split(';');
				const sha = parts[0];
				const refName = parts[1];
				const summary = parts[2];
				const date = parts[3];

				return { sha, refName, summary, date };
			});
	} catch (err) {
		console.log('Error requesting commits', err);
	}
};

module.exports = commits;
