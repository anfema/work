const execa = require('execa');
const split2 = require('split2');
const through2 = require('through2');
const semver = require('semver');
const getStream = require('get-stream');

const tagsRegex = /commit\s(.*)\s\(tag:\s*(.+?)[,\)]/gi;

function repositoryTags(options = { cwd: '.' }) {
	options.maxBuffer = options.maxBuffer || Infinity;

	return execa('git', ['log', '--decorate', '--no-color'], options)
		.stdout.pipe(split2())
		.pipe(
			through2.obj(function transform(line, enc, cb) {
				const match = tagsRegex.exec(line);

				if (match !== null) {
					const [, hash, tag] = match;

					// eslint-disable-next-line no-invalid-this
					this.push({
						tag: semver.clean(tag),
						hash,
					});
				}

				cb();
			})
		);
}

const allTags = async (options = { cwd: '.' }) => {
	const tagsStream = repositoryTags(options);
	const tags = await getStream.array(tagsStream);

	return tags;
};

const lastTag = async (options = { cwd: '.' }) => {
	const tags = await allTags(options);

	return tags[0];
};

module.exports = {
	all: allTags,
	last: lastTag,
};
