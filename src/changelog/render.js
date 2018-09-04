const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const config = require('../config.js');

const changelogTemplatePath = path.join(__dirname, '..', 'templates', 'changelog.hbs');
const changelogTemplate = Handlebars.compile(fs.readFileSync(changelogTemplatePath).toString());

module.exports = function renderChangelog(pullRequests) {
	const prefixSorting = Object.keys(config.prefixes);

	const pullRequestsSorted = pullRequests.reduce((acc, { prefix, title, data }) => {
		acc[prefix] = acc[prefix] || [];
		acc[prefix].push({
			title,
			prefix,
			data,
		});

		return acc;
	}, {});

	const pullRequestGroups = Object.keys(pullRequestsSorted)
		.reduce((acc, key) => {
			acc.push({
				title: config.prefixes[key] || key,
				key,
				items: pullRequestsSorted[key],
			});

			return acc;
		}, [])
		.sort((a, b) => {
			if (prefixSorting.indexOf(a.key) > prefixSorting.indexOf(b.key)) {
				return 1;
			}

			if (prefixSorting.indexOf(a.key) < prefixSorting.indexOf(b.key)) {
				return -1;
			}

			return 0;
		});

	return changelogTemplate({ pullRequestGroups });
};
