import { setConfig } from 'next/config'

setConfig({
  publicRuntimeConfig: {
    NODE_ENV: 'test',
    DEPLOY_ENV: 'preprod',
    BASE_URL: 'https://preprod.sawl.dev',
  },
})
