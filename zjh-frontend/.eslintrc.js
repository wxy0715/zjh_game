const { getESLintConfig } = require('@iceworks/spec');

// https://www.npmjs.com/package/@iceworks/spec
module.exports = getESLintConfig('react-ts', {
  rules: {
    'react/jsx-indent': 'off',
    '@typescript-eslint/indent': 'off',
  },
});
