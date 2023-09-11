import { useMemo } from 'react'

import {
  Auth0Icon,
  CSS3Icon,
  ChromeIcon,
  CypressIcon,
  DockerIcon,
  EslintIcon,
  GitIcon,
  GitLabIcon,
  GithubIcon,
  HTML5Icon,
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

import { AnimatedItemProps } from '@web/components/AnimatedItem/AnimatedItem'

export function useMainPortalItems() {
  const items: AnimatedItemProps[] = useMemo(
    () => [
      {
        svg: <NodeJSIcon />,
        path: 'https://nodejs.org/en/',
        ariaLabel: 'NodeJS',
      },
      {
        svg: <CSS3Icon />,
        size: 'S',
        path: 'https://www.w3.org/Style/CSS/',
        ariaLabel: 'CSS3',
      },
      {
        svg: <GithubIcon />,
        size: 'S',
        path: 'https://github.com',
        ariaLabel: 'Github',
      },
      {
        svg: <TypescriptIcon />,
        size: 'S',
        path: 'https://www.typescriptlang.org/',
        ariaLabel: 'Typescript',
      },
      {
        svg: <NextJSIcon />,
        path: 'https://nextjs.org',
        ariaLabel: 'NextJS',
        size: 'L',
      },
      {
        svg: <ReactJSIcon />,
        path: 'https://reactjs.org',
        ariaLabel: 'ReactJS',
        size: 'L',
      },
      {
        svg: <MongoDBIcon />,
        size: 'S',
        path: 'https://www.mongodb.com',
        ariaLabel: 'MongoDB',
      },
      {
        svg: <ReactQueryIcon />,
        path: 'https://react-query.tanstack.com/',
        ariaLabel: 'Tanstack React Query',
      },
      { svg: <JestIcon />, path: 'https://jestjs.io', ariaLabel: 'Jest' },
      { svg: <NxIcon />, size: 'S', path: 'https://nx.dev', ariaLabel: 'Nx' },
      {
        svg: <YarnIcon />,
        size: 'S',
        path: 'https://yarnpkg.com',
        ariaLabel: 'Yarn',
      },
      {
        svg: <ScottPilgrimIcon />,
        size: 'M',
        path: 'https://onipress.com/collections/scott-pilgrim',
        ariaLabel: 'Scott Pilgrim',
      },
      {
        svg: <XataIOIcon />,
        size: 'S',
        path: 'https://xata.io',
        ariaLabel: 'Xata IO',
      },
      {
        svg: <StyledComponentsIcon />,
        path: 'https://styled-components.com',
        ariaLabel: 'Styled Components',
      },
      { svg: <EslintIcon />, path: 'https://eslint.org', ariaLabel: 'ESLint' },
      {
        svg: <CypressIcon />,
        path: 'https://www.cypress.io',
        ariaLabel: 'Cypress',
      },
      {
        svg: <PrettierIcon />,
        path: 'https://prettier.io',
        ariaLabel: 'Prettier',
      },
      {
        svg: <DockerIcon />,
        path: 'https://www.docker.com',
        ariaLabel: 'Docker',
      },
      {
        svg: <HTML5Icon />,
        path: 'https://www.w3.org/html/',
        ariaLabel: 'HTML5',
      },
      {
        svg: <JavascriptIcon />,
        path: 'https://developer.mozilla.org/en/JavaScript',
        ariaLabel: 'JavaScript',
      },
      {
        svg: <NpmIcon />,
        path: 'https://www.npmjs.com',
        ariaLabel: 'Node Package Manager',
      },
      { svg: <GitIcon />, path: 'https://git-scm.com', ariaLabel: 'Git' },
      {
        svg: <ChromeIcon />,
        path: 'https://www.google.com/chrome',
        ariaLabel: 'Google Chrome',
      },
      {
        svg: <VSCodeIcon />,
        path: 'https://code.visualstudio.com',
        ariaLabel: 'Visual Studio Code',
      },
      {
        svg: <MaterialUiIcon />,
        path: 'https://material-ui.com',
        ariaLabel: 'Material UI',
      },
      {
        svg: <PostgresSqlIcon />,
        path: 'https://www.postgresql.org',
        ariaLabel: 'PostgreSQL',
      },
      {
        svg: <SentryIcon />,
        path: 'https://sentry.io',
        ariaLabel: 'Sentry',
      },
      {
        svg: <StorybookIcon />,
        path: 'https://storybook.js.org',
        ariaLabel: 'Storybook',
      },
      {
        svg: <WebpackIcon />,
        path: 'https://webpack.js.org',
        ariaLabel: 'Webpack',
      },
      { svg: <GitLabIcon />, path: 'https://gitlab.com', ariaLabel: 'GitLab' },
      { svg: <JsonIcon />, path: 'https://json.org', ariaLabel: 'JSON' },
      { svg: <VercelIcon />, path: 'https://vercel.com', ariaLabel: 'Vercel' },
      { svg: <Auth0Icon />, path: '  https://auth0.com', ariaLabel: 'Auth0' },
      {
        svg: <SpiderManIcon />,
        path: 'https://wikipedia.org/wiki/Spider-Man',
        ariaLabel: 'Spider Man',
      },
    ],
    []
  )

  return items
}
