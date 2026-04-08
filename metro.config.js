const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const { transformer, resolver } = config;

config.transformer = {
	...transformer,
	babelTransformerPath: require.resolve("@lingui/metro-transformer/expo"),
};
config.resolver = {
	...resolver,
	extraNodeModules: {
		...(resolver.extraNodeModules || {}),
		"better-sqlite3": require.resolve("./shims/better-sqlite3"),
	},
	sourceExts: [...resolver.sourceExts, "po", "pot"],
};

module.exports = config;
