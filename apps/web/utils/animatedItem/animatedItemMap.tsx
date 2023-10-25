import {
  Auth0Icon,
  BF2042Icon,
  CSS3Icon,
  ChromeIcon,
  CypressIcon,
  DockerIcon,
  EslintIcon,
  GitIcon,
  GitLabIcon,
  GithubIcon,
  HTML5Icon,
  HalfLifeIcon,
  JavascriptIcon,
  JestIcon,
  JsonIcon,
  MaterialUiIcon,
  MongoDBIcon,
  NextJSIcon,
  NodeJSIcon,
  NpmIcon,
  NxIcon,
  PostgresSqlIcon,
  PrettierIcon,
  ReactJSIcon,
  ReactQueryIcon,
  ScottPilgrimIcon,
  SentryIcon,
  SpiderManIcon,
  StorybookIcon,
  StyledComponentsIcon,
  TypescriptIcon,
  VSCodeIcon,
  VercelIcon,
  WebpackIcon,
  XataIOIcon,
  YarnIcon,
} from '@sdlgr/assets'

import { AnimatedElement } from '@web/components/AnimatedItem/AnimatedItem'

export type AnimatedItemKey =
  | 'auth0'
  | 'bf2042'
  | 'chrome'
  | 'css3'
  | 'cypress'
  | 'docker'
  | 'eslint'
  | 'git'
  | 'gitlab'
  | 'github'
  | 'halfLife'
  | 'html'
  | 'javascript'
  | 'jest'
  | 'json'
  | 'materialUI'
  | 'mongoDB'
  | 'nextJS'
  | 'nodeJS'
  | 'npm'
  | 'nx'
  | 'postgreSql'
  | 'prettier'
  | 'reactJS'
  | 'reactQuery'
  | 'scottPilgrim'
  | 'sentry'
  | 'spiderMan'
  | 'storybook'
  | 'styledComponents'
  | 'typescript'
  | 'vercel'
  | 'vscode'
  | 'webpack'
  | 'xataIO'
  | 'yarn'

export const animatedItemMap: Record<AnimatedItemKey, AnimatedElement> = {
  nodeJS: {
    svg: <NodeJSIcon />,
    path: 'https://nodejs.org/en/',
    ariaLabel: 'NodeJS',
  },
  css3: {
    svg: <CSS3Icon />,
    size: 'S',
    path: 'https://www.w3.org/Style/CSS/',
    ariaLabel: 'CSS3',
  },
  github: {
    svg: <GithubIcon />,
    size: 'S',
    path: 'https://github.com',
    ariaLabel: 'Github',
  },
  typescript: {
    svg: <TypescriptIcon />,
    path: 'https://www.typescriptlang.org/',
    ariaLabel: 'Typescript',
  },
  nextJS: {
    svg: <NextJSIcon />,
    path: 'https://nextjs.org',
    ariaLabel: 'NextJS',
    size: 'L',
  },
  reactJS: {
    svg: <ReactJSIcon />,
    path: 'https://reactjs.org',
    ariaLabel: 'ReactJS',
    size: 'L',
  },
  mongoDB: {
    svg: <MongoDBIcon />,
    size: 'S',
    path: 'https://www.mongodb.com',
    ariaLabel: 'MongoDB',
  },
  reactQuery: {
    svg: <ReactQueryIcon />,
    path: 'https://react-query.tanstack.com/',
    ariaLabel: 'Tanstack React Query',
  },
  jest: { svg: <JestIcon />, path: 'https://jestjs.io', ariaLabel: 'Jest' },
  nx: { svg: <NxIcon />, size: 'S', path: 'https://nx.dev', ariaLabel: 'Nx' },
  yarn: {
    svg: <YarnIcon />,
    size: 'S',
    path: 'https://yarnpkg.com',
    ariaLabel: 'Yarn',
  },
  scottPilgrim: {
    svg: <ScottPilgrimIcon />,
    size: 'M',
    path: 'https://onipress.com/collections/scott-pilgrim',
    ariaLabel: 'Scott Pilgrim',
    focusable: false,
  },
  xataIO: {
    svg: <XataIOIcon />,
    size: 'S',
    path: 'https://xata.io',
    ariaLabel: 'Xata IO',
  },
  styledComponents: {
    svg: <StyledComponentsIcon />,
    path: 'https://styled-components.com',
    ariaLabel: 'Styled Components',
  },
  eslint: {
    svg: <EslintIcon />,
    path: 'https://eslint.org',
    ariaLabel: 'ESLint',
  },
  cypress: {
    svg: <CypressIcon />,
    path: 'https://www.cypress.io',
    ariaLabel: 'Cypress',
  },
  prettier: {
    svg: <PrettierIcon />,
    path: 'https://prettier.io',
    ariaLabel: 'Prettier',
  },
  docker: {
    svg: <DockerIcon />,
    path: 'https://www.docker.com',
    ariaLabel: 'Docker',
  },
  html: {
    svg: <HTML5Icon />,
    path: 'https://www.w3.org/html/',
    ariaLabel: 'HTML5',
  },
  javascript: {
    svg: <JavascriptIcon />,
    path: 'https://developer.mozilla.org/en/JavaScript',
    ariaLabel: 'JavaScript',
  },
  npm: {
    svg: <NpmIcon />,
    path: 'https://www.npmjs.com',
    ariaLabel: 'Node Package Manager',
  },
  git: { svg: <GitIcon />, path: 'https://git-scm.com', ariaLabel: 'Git' },
  chrome: {
    svg: <ChromeIcon />,
    path: 'https://www.google.com/chrome',
    ariaLabel: 'Google Chrome',
  },
  vscode: {
    svg: <VSCodeIcon />,
    path: 'https://code.visualstudio.com',
    ariaLabel: 'Visual Studio Code',
  },
  materialUI: {
    svg: <MaterialUiIcon />,
    path: 'https://material-ui.com',
    ariaLabel: 'Material UI',
  },
  postgreSql: {
    svg: <PostgresSqlIcon />,
    path: 'https://www.postgresql.org',
    ariaLabel: 'PostgreSQL',
  },
  sentry: {
    svg: <SentryIcon />,
    path: 'https://sentry.io',
    ariaLabel: 'Sentry',
  },
  storybook: {
    svg: <StorybookIcon />,
    path: 'https://storybook.js.org',
    ariaLabel: 'Storybook',
  },
  webpack: {
    svg: <WebpackIcon />,
    path: 'https://webpack.js.org',
    ariaLabel: 'Webpack',
  },
  gitlab: {
    svg: <GitLabIcon />,
    path: 'https://gitlab.com',
    ariaLabel: 'GitLab',
  },
  json: { svg: <JsonIcon />, path: 'https://json.org', ariaLabel: 'JSON' },
  vercel: {
    svg: <VercelIcon />,
    path: 'https://vercel.com',
    ariaLabel: 'Vercel',
  },
  auth0: {
    svg: <Auth0Icon />,
    path: '  https://auth0.com',
    ariaLabel: 'Auth0',
  },
  spiderMan: {
    svg: <SpiderManIcon />,
    path: 'https://wikipedia.org/wiki/Spider-Man',
    ariaLabel: 'Spider Man',
    focusable: false,
  },
  halfLife: {
    svg: <HalfLifeIcon />,
    path: 'https://half-life.com/',
    ariaLabel: 'Half-Life',
    focusable: false,
  },
  bf2042: {
    svg: <BF2042Icon />,
    path: 'https://www.ea.com/en-gb/games/battlefield/battlefield-2042',
    ariaLabel: 'Battlefield 2042',
    focusable: false,
  },
}
