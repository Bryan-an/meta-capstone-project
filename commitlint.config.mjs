/** @type {import('commitlint').UserConfig} */
const commitlintConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [0, 'always'],
  },
};

export default commitlintConfig;
