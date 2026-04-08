module.exports = function (api) {
	api.cache(true);
	return {
		presets: ["babel-preset-expo"],
		plugins: [
			[
				"@tamagui/babel-plugin",
				{
					components: ["tamagui"],
					config: "./tamagui.config.ts",
					logTimings: true,
					disableExtraction: process.env.NODE_ENV === "development",
				},
			],

			"@lingui/babel-plugin-lingui-macro",
			// NOTE: this is only necessary if you are using reanimated for animations
			"react-native-reanimated/plugin",
		],
		overrides: [
			{
				test: /\.(ts|tsx)$/,
				plugins: [
					["@babel/plugin-transform-typescript", { allowDeclareFields: true }],
					["@babel/plugin-proposal-decorators", { legacy: true }],
					["@babel/plugin-proposal-class-properties", { loose: true }],
				],
			},
		],
	};
};
