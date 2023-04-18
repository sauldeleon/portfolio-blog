module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-plugin-custom`
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
  plugins: ["custom"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: ["plugin:custom/typescript"],
      rules: {},
    },
    {
      files: ["*.js", "*.jsx", "*.cjs", "*.mjs"],
      extends: ["plugin:custom/javascript"],
      rules: {},
    },
    {
      files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
      plugins: ["testing-library"],
      extends: ["plugin:testing-library/react", "plugin:testing-library/dom"],
    },
  ],
};
