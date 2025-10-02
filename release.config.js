module.exports = {
	repositoryUrl: "git@github.com:displaynone/lissn.git",
	branches: [
		"main",
		{ name: "beta", prerelease: true },
		{ name: "alpha", prerelease: true },
	],
	plugins: [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		[
			"@semantic-release/changelog",
			{
				changelogFile: "CHANGELOG.md",
			},
		],
		[
			"@semantic-release/npm",
			{
				npmPublish: false,
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["CHANGELOG.md", "package.json", "package-lock.json"],
				message: "chore(release): ${nextRelease.version} [skip ci]",
			},
		],
		[
			"@semantic-release/github",
			{
				successComment: false,
				failComment: false,
			},
		],
		[
			"@semantic-release/commit-analyzer",
			{
				preset: "conventionalcommits",
				releaseRules: [
					{ type: "feature", release: "minor" },
					{ type: "ui", release: "minor" },
					{ type: "fix", release: "patch" },
					{ type: "hotfix", release: "patch" },
					{ type: "docs", release: false },
				],
			},
		],
	],
};
