import { useMemo } from 'react'

import {
  Auth0Icon,
  CSS3Icon,
  ChromeIcon,
  CypressIcon,
  DockerIcon,
  EslintIcon,
  GitIcon,
  GithubIcon,
  GitlabIcon,
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
  PostgreSqlIcon,
  PrettierIcon,
  ReactJSIcon,
  ReactQueryIcon,
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
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <CSS3Icon />,
        rotate: true,
        colorSwap: true,
        size: 'S',
      },
      {
        svg: <GithubIcon />,
        rotate: true,
        colorSwap: true,
        size: 'S',
      },
      {
        svg: <TypescriptIcon />,
        rotate: true,
        colorSwap: true,
        size: 'S',
      },
      {
        svg: <NextJSIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <ReactJSIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <MongoDBIcon />,
        rotate: true,
        colorSwap: true,
        size: 'S',
      },
      {
        svg: <ReactQueryIcon />,
        rotate: true,
      },
      {
        svg: <JestIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <NxIcon />,
        rotate: true,
        size: 'S',
        colorSwap: true,
      },
      {
        svg: <YarnIcon />,
        rotate: true,
        size: 'S',
        colorSwap: true,
      },
      {
        svg: <XataIOIcon />,
        rotate: true,
        size: 'S',
      },
      {
        svg: <StyledComponentsIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <EslintIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <CypressIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <PrettierIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <DockerIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <HTML5Icon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <JavascriptIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <NpmIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <GitIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <ChromeIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <VSCodeIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <MaterialUiIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <PostgreSqlIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <SentryIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <StorybookIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <WebpackIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <GitlabIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <JsonIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <VercelIcon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <Auth0Icon />,
        rotate: true,
        colorSwap: true,
      },
      {
        svg: <SpiderManIcon />,
        rotate: true,
        colorSwap: true,
      },
    ],
    []
  )

  return items
}
