/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
	sourceLocale: "en",
	locales: ["en", "es", "fr", "it", "de", "ko", "ja", "ar", "zh", "hi"],
	catalogs: [
		{
			path: "<rootDir>/locales/{locale}/messages",
			include: ["app", "components", "utils"],
		},
	],
	format: "po",
};
