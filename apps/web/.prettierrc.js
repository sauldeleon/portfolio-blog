/* istanbul ignore file */
module.exports = {
  ...require('../../.prettierrc.js'),
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '^@sdlgr/(.*)$',
    '^@web/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
