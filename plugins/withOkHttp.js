const { withAppBuildGradle } = require('@expo/config-plugins');

const DEP = 'implementation(platform("com.squareup.okhttp3:okhttp-bom:4.12.0"))\n    implementation("com.squareup.okhttp3:okhttp")';

function alreadyHasDependency(contents) {
  return contents.includes('com.squareup.okhttp3:okhttp');
}

function injectDependency(contents, language) {
  if (alreadyHasDependency(contents)) return contents;

  const re = /(^|\n)\s*dependencies\s*\{/;
  if (re.test(contents)) {
    return contents.replace(re, match => `${match}\n    ${DEP}`);
  }

  const block =
`\n\ndependencies {\n    ${DEP}\n}\n`;
  return contents + block;
}

module.exports = function withOkHttp(config) {
  return withAppBuildGradle(config, config => {
    const mod = config.modResults;
    // mod.language: 'groovy' | 'kotlin'
    mod.contents = injectDependency(mod.contents, mod.language);
    return config;
  });
};
