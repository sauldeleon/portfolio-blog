import { NodeJSIcon } from '@sdlgr/assets'
import { renderApp } from '@sdlgr/test-utils'

import { ExperienceItem } from './ExperienceItem'

describe('ExperienceItem', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(
      <ExperienceItem
        order={0}
        company="test"
        technologies={[
          {
            svg: <NodeJSIcon />,
            path: 'https://nodejs.org/en/',
            ariaLabel: 'NodeJS',
          },
        ]}
        beginDate="January 2022"
        link="https://www.test.com/"
        linkLabel="Check website"
        descriptionParagraphs={[
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non quam nec dui luctus faucibus. Nullam quis risus eget urna mollis ornare vel eu leo.',
          'Nulla vitae elit libero, a pharetra augue. Donec ullamcorper nulla non metus auctor fringilla.',
        ]}
      />,
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should render with end date', () => {
    const { baseElement } = renderApp(
      <ExperienceItem
        order={0}
        company="test"
        technologies={[
          {
            svg: <NodeJSIcon />,
            path: 'https://nodejs.org/en/',
            ariaLabel: 'NodeJS',
          },
        ]}
        beginDate="January 2022"
        endDate="January 2023"
        link="https://www.test.com/"
        linkLabel="Check website"
        descriptionParagraphs={[
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non quam nec dui luctus faucibus. Nullam quis risus eget urna mollis ornare vel eu leo.',
          'Nulla vitae elit libero, a pharetra augue. Donec ullamcorper nulla non metus auctor fringilla.',
        ]}
      />,
    )
    expect(baseElement).toMatchSnapshot()
  })
})
