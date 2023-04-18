const typescript = require('./config/typescript')
const javascript = require('./config/javascript')
const reactTmp = require('./config/react-tmp')
const reactTypescript = require('./config/react-typescript')
const reactJsx = require('./config/react-jsx')
const reactBase = require('./config/react-base')
const turbo = require('./config/turbo')

module.exports = {
  configs: {
    typescript: typescript.default,
    javascript: javascript.default,
    react: reactTmp.default,
    'react-base': reactBase.default,
    'react-typescript': reactTypescript.default,
    'react-jsx': reactJsx.default,
    turbo: turbo.default,
  },
}
