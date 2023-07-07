/* istanbul ignore file */
module.exports = {
  ...require('../../.prettierrc.js'),
  importOrder: ['<THIRD_PARTY_MODULES>', '^@nx/(.*)$', '^@web/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
