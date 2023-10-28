import {
  AngularJSIcon,
  ArduinoIcon,
  Auth0Icon,
  BF2042Icon,
  CSS3Icon,
  ChromeIcon,
  CypressIcon,
  DockerIcon,
  EslintIcon,
  ExpoIcon,
  ExpressJSIcon,
  GitIcon,
  GitLabIcon,
  GithubIcon,
  GwtIcon,
  HTML5Icon,
  HalfLifeIcon,
  HibernateIcon,
  IonicIcon,
  JavaIcon,
  JavascriptIcon,
  JestIcon,
  JsonIcon,
  LitElementIcon,
  MaterialUiIcon,
  MochaIcon,
  MongoDBIcon,
  NextJSIcon,
  NodeJSIcon,
  NpmIcon,
  NxIcon,
  OracleIcon,
  PerlIcon,
  PostgresSqlIcon,
  PrettierIcon,
  PythonIcon,
  ReactJSIcon,
  ReactQueryIcon,
  ReduxIcon,
  ScottPilgrimIcon,
  SenchaIcon,
  SentryIcon,
  SocketIOIcon,
  SpiderManIcon,
  SpringIcon,
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
  | 'angularJS'
  | 'arduino'
  | 'auth0'
  | 'bf2042'
  | 'chrome'
  | 'css3'
  | 'cypress'
  | 'docker'
  | 'eslint'
  | 'expo'
  | 'expressJS'
  | 'git'
  | 'github'
  | 'gitlab'
  | 'gwt'
  | 'halfLife'
  | 'hibernate'
  | 'html'
  | 'ionic'
  | 'java'
  | 'javascript'
  | 'jest'
  | 'json'
  | 'litElement'
  | 'materialUI'
  | 'mocha'
  | 'mongoDB'
  | 'nextJS'
  | 'nodeJS'
  | 'npm'
  | 'nx'
  | 'oracle'
  | 'perl'
  | 'postgreSql'
  | 'prettier'
  | 'python'
  | 'reactJS'
  | 'reactQuery'
  | 'redux'
  | 'scottPilgrim'
  | 'sencha'
  | 'sentry'
  | 'socketIO'
  | 'spiderMan'
  | 'spring'
  | 'storybook'
  | 'styledComponents'
  | 'typescript'
  | 'vercel'
  | 'vscode'
  | 'webpack'
  | 'xataIO'
  | 'yarn'

export const animatedItemMap: Record<AnimatedItemKey, AnimatedElement> = {
  angularJS: {
    ariaLabel: 'AngularJS',
    path: 'https://angular.io',
    svg: <AngularJSIcon />,
  },
  arduino: {
    ariaLabel: 'Arduino',
    path: 'https://www.arduino.cc/',
    svg: <ArduinoIcon />,
  },
  auth0: {
    ariaLabel: 'Auth0',
    path: '  https://auth0.com',
    svg: <Auth0Icon />,
  },
  bf2042: {
    ariaLabel: 'Battlefield 2042',
    focusable: false,
    path: 'https://www.ea.com/en-gb/games/battlefield/battlefield-2042',
    svg: <BF2042Icon />,
  },
  chrome: {
    ariaLabel: 'Google Chrome',
    path: 'https://www.google.com/chrome',
    svg: <ChromeIcon />,
  },
  css3: {
    ariaLabel: 'CSS3',
    path: 'https://www.w3.org/Style/CSS/',
    size: 'S',
    svg: <CSS3Icon />,
  },
  cypress: {
    ariaLabel: 'Cypress',
    path: 'https://www.cypress.io',
    svg: <CypressIcon />,
  },
  docker: {
    ariaLabel: 'Docker',
    path: 'https://www.docker.com',
    svg: <DockerIcon />,
  },
  eslint: {
    ariaLabel: 'ESLint',
    path: 'https://eslint.org',
    svg: <EslintIcon />,
  },
  expressJS: {
    ariaLabel: 'ExpressJS',
    path: 'https://expressjs.com',
    svg: <ExpressJSIcon />,
  },
  expo: {
    ariaLabel: 'Expo',
    path: 'https://expo.dev',
    svg: <ExpoIcon />,
  },
  git: {
    ariaLabel: 'Git',
    path: 'https://git-scm.com',
    svg: <GitIcon />,
  },
  github: {
    ariaLabel: 'Github',
    path: 'https://github.com',
    size: 'S',
    svg: <GithubIcon />,
  },
  gitlab: {
    ariaLabel: 'GitLab',
    path: 'https://gitlab.com',
    svg: <GitLabIcon />,
  },
  gwt: {
    ariaLabel: 'Google Web Toolkit',
    path: 'https://developers.google.com/web-toolkit',
    svg: <GwtIcon />,
  },
  halfLife: {
    ariaLabel: 'Half-Life',
    focusable: false,
    path: 'https://half-life.com/',
    svg: <HalfLifeIcon />,
  },
  hibernate: {
    ariaLabel: 'Hibernate',
    path: 'https://hibernate.org',
    svg: <HibernateIcon />,
  },
  html: {
    ariaLabel: 'HTML5',
    path: 'https://www.w3.org/html/',
    svg: <HTML5Icon />,
  },
  ionic: {
    ariaLabel: 'Ionic',
    path: 'https://ionicframework.com',
    svg: <IonicIcon />,
  },
  java: {
    ariaLabel: 'Java',
    path: 'https://java.com',
    svg: <JavaIcon />,
  },
  javascript: {
    ariaLabel: 'JavaScript',
    path: 'https://developer.mozilla.org/en/JavaScript',
    svg: <JavascriptIcon />,
  },
  jest: {
    ariaLabel: 'Jest',
    path: 'https://jestjs.io',
    svg: <JestIcon />,
  },
  json: {
    ariaLabel: 'JSON',
    path: 'https://json.org',
    svg: <JsonIcon />,
  },
  litElement: {
    ariaLabel: 'LitElement',
    path: 'https://lit.dev',
    svg: <LitElementIcon />,
  },
  materialUI: {
    ariaLabel: 'Material UI',
    path: 'https://material-ui.com',
    svg: <MaterialUiIcon />,
  },
  mocha: {
    ariaLabel: 'Mocha',
    path: 'https://mochajs.org',
    svg: <MochaIcon />,
  },
  mongoDB: {
    ariaLabel: 'MongoDB',
    path: 'https://www.mongodb.com',
    size: 'S',
    svg: <MongoDBIcon />,
  },
  nextJS: {
    ariaLabel: 'NextJS',
    path: 'https://nextjs.org',
    size: 'L',
    svg: <NextJSIcon />,
  },
  nodeJS: {
    ariaLabel: 'NodeJS',
    path: 'https://nodejs.org/en/',
    svg: <NodeJSIcon />,
  },
  npm: {
    ariaLabel: 'Node Package Manager',
    path: 'https://www.npmjs.com',
    svg: <NpmIcon />,
  },
  nx: {
    ariaLabel: 'Nx',
    path: 'https://nx.dev',
    size: 'S',
    svg: <NxIcon />,
  },
  oracle: {
    ariaLabel: 'Oracle',
    path: 'https://www.oracle.com',
    svg: <OracleIcon />,
  },
  perl: {
    ariaLabel: 'Perl',
    path: 'https://www.perl.org',
    svg: <PerlIcon />,
  },
  postgreSql: {
    ariaLabel: 'PostgreSQL',
    path: 'https://www.postgresql.org',
    svg: <PostgresSqlIcon />,
  },
  prettier: {
    ariaLabel: 'Prettier',
    path: 'https://prettier.io',
    svg: <PrettierIcon />,
  },
  python: {
    ariaLabel: 'Python',
    path: 'https://www.python.org',
    svg: <PythonIcon />,
  },
  reactJS: {
    ariaLabel: 'ReactJS',
    path: 'https://reactjs.org',
    size: 'L',
    svg: <ReactJSIcon />,
  },
  reactQuery: {
    ariaLabel: 'Tanstack React Query',
    path: 'https://react-query.tanstack.com/',
    svg: <ReactQueryIcon />,
  },
  redux: {
    ariaLabel: 'Redux',
    path: 'https://redux.js.org',
    svg: <ReduxIcon />,
  },
  scottPilgrim: {
    ariaLabel: 'Scott Pilgrim',
    focusable: false,
    path: 'https://onipress.com/collections/scott-pilgrim',
    size: 'M',
    svg: <ScottPilgrimIcon />,
  },
  sencha: {
    ariaLabel: 'Ext JS',
    path: 'https://www.sencha.com/products/extjs/',
    svg: <SenchaIcon />,
  },
  sentry: {
    ariaLabel: 'Sentry',
    path: 'https://sentry.io',
    svg: <SentryIcon />,
  },
  socketIO: {
    ariaLabel: 'SocketIO',
    path: 'https://socket.io',
    svg: <SocketIOIcon />,
  },
  spiderMan: {
    ariaLabel: 'Spider Man',
    focusable: false,
    path: 'https://wikipedia.org/wiki/Spider-Man',
    svg: <SpiderManIcon />,
  },
  spring: {
    ariaLabel: 'Spring',
    path: 'https://spring.io',
    svg: <SpringIcon />,
  },
  storybook: {
    ariaLabel: 'Storybook',
    path: 'https://storybook.js.org',
    svg: <StorybookIcon />,
  },
  styledComponents: {
    ariaLabel: 'Styled Components',
    path: 'https://styled-components.com',
    svg: <StyledComponentsIcon />,
  },
  typescript: {
    ariaLabel: 'Typescript',
    path: 'https://www.typescriptlang.org/',
    svg: <TypescriptIcon />,
  },
  vercel: {
    ariaLabel: 'Vercel',
    path: 'https://vercel.com',
    svg: <VercelIcon />,
  },
  vscode: {
    ariaLabel: 'Visual Studio Code',
    path: 'https://code.visualstudio.com',
    svg: <VSCodeIcon />,
  },
  webpack: {
    ariaLabel: 'Webpack',
    path: 'https://webpack.js.org',
    svg: <WebpackIcon />,
  },
  xataIO: {
    ariaLabel: 'Xata IO',
    path: 'https://xata.io',
    size: 'S',
    svg: <XataIOIcon />,
  },
  yarn: {
    ariaLabel: 'Yarn',
    path: 'https://yarnpkg.com',
    size: 'S',
    svg: <YarnIcon />,
  },
}
