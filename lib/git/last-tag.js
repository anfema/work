const execa = require('execa');

module.exports = async () => {
	try {
		const { stdout } = await execa('git', ['describe', '--abbrev=0', '--tags']);

		return stdout;
	} catch (err) {
		console.log(`Can't select last tag.`, err);
	}

	return null;
};
