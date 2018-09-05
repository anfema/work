module.exports = {
	branchFormat: '[USERNAME]/[ISSUEID]-[DESCRIPTION]',
	defaultBranch: 'develop',

	cwd: process.cwd(),

	prefixes: {
		feature: 'Features',
		bugfix: 'Fixed Bugs',
		refactor: 'Improved Code',
		test: 'Improved Tests',
		chore: 'Miscellaneous',
	},

	changelog: {
		'New Features & Improvements': ['Enhancement', 'Feature'],
		'Fixed Bugs': ['Bug'],
		'Behind the scenes': ['Refactor'],
		'Other changes': ['Chore'],
	},

	tagFrom: '',
	tagTo: 'HEAD',

	// As of 2018-09-04
	githubLabelstoDelete: [
		'bug',
		'duplicate',
		'enhancement',
		'good first issue',
		'help wanted',
		'invalid',
		'question',
		'wontfix',
	],

	defaultLabels: [
		// Workflow columns
		{ name: 'Status: To Do', color: '#73D0FF' },
		{ name: 'Status: Blocked', color: '#363E4A' },
		{ name: 'Status: In Progress', color: '#95E6CB' },
		{ name: 'Status: Has PR', color: '#BAE67E' },
		{ name: 'Status: To Test', color: '#FFC44C' },

		// Types
		{ name: 'Bug', color: '#EE0701' },
		{ name: 'Change Request', color: '#D4BFFF' },
		{ name: 'Chore', color: '#E3EFF8' },
		{ name: 'Enhancement', color: '#0052CC' },
		{ name: 'Needs Design', color: '#363E4A' },
		{ name: 'Needs Discussion', color: '#363E4A' },
		{ name: 'Refactor', color: '#E3EFF8' },
		{ name: 'Test', color: '#CCC9C2' },

		// Priority
		{ name: 'Priority: Low', color: '#667380' },
		{ name: 'Priority: !!!', color: '#FFA759' },

		// Resolved states
		{ name: 'Closed: Duplicate', color: '#FFFFFF' },
		{ name: 'Closed: Invalid', color: '#FFFFFF' },
		{ name: 'Closed: Wontfix', color: '#FFFFFF' },

		// Managed by CodeTree
		{ name: 'codetree-epic', color: '#FBF4EF' },
		{ name: 'size: 1', color: '#FBF4EF' },
		{ name: 'size: 2', color: '#FBF4EF' },
		{ name: 'size: 4', color: '#FBF4EF' },
		{ name: 'size: 8', color: '#FBF4EF' },
	],
};
