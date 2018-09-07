const chalk = require('chalk');
const { highlight } = require('cli-highlight');
const { template, sortBy } = require('lodash');

const changelogTemplate = template(`<%
	versions.forEach(version => {
%>
## <%= version.version %>
<%
		version.categories.forEach(category => {
%>
### <%=
			category.title
%>

<%
			category.entries.reverse().forEach(entry => {
%>- #<%=
				entry.pr.number
%><%
				if (entry.otherLabels.length > 0) {
%> [<%=
					entry.otherLabels.join(', ')
%>]<%
				}
%> <%=
				entry.pr.title.trim()
%> @<%=
				entry.pr.user.login
%>
<%
			})
%><%
		})
%><%
	})
%>
`);

module.exports = function render(data) {
	const payload = {
		versions: [...data.entries()].reduce((versions, [version, { commits, categories }]) => {
			if (commits.length > 0) {
				versions.push({
					version,
					categories: [...categories.entries()].reduce((acc, [title, entries]) => {
						if (entries.size === 0) {
							return acc;
						}

						entries = [...entries.values()];
						entries = sortBy(entries, entry => entry.pr.number);

						acc.push({
							title,
							entries,
						});

						return acc;
					}, []),
				});
			}

			return versions;
		}, []),
	};

	if (payload.versions.length === 0) {
		console.error(chalk.yellow(`No pull requests in selected range.`));

		return '';
	}

	const rendered = changelogTemplate(payload);

	if (chalk.enabled) {
		return highlight(rendered, {
			language: 'Markdown',
			theme: {
				section: chalk.bold.blue,
				string: chalk.gray,
				link: chalk.dim,
			},
		});
	}

	return rendered;
};
