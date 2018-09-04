const semver = require('semver');
const { last: lastTag } = require('./lib/repository-tags.js');
const repoPath = require('./repository-path.js');

/**
 * Create a new semantic version based on the last tag in the repo
 *
 * @param {String} step the semantic version range to increase. Defaults to 'major'
 * @returns {String} a new version number
 */
module.exports = async function nextVersion(step = 'major') {
	const lastRelease = await lastTag({ cwd: repoPath });

	semver.inc(lastRelease.tag, step);
};
