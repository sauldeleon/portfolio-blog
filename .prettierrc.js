/* istanbul ignore file */
module.exports = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  singleQuote: true,
  semi: false,
  importOrder: ['<THIRD_PARTY_MODULES>', '^@sdlgr/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
