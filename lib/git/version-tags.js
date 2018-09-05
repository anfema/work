const execa = require('execa');
const semver = require('semver');

module.exports = async () => {
	try {
		const { stdout: localTags } = await execa('git', ['tag']);

		return localTags
			.split('\n')
			.map(semver.clean)
			.filter(semver.valid)
			.sort(semver.rcompare);
	} catch (err) {
		console.log(`Can't list version tags`, err);
	}

	return null;
};
