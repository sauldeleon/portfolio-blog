import { render } from '@testing-library/react'
import styled, { ThemeProvider } from 'styled-components'

import { mainTheme } from './main-theme'

describe('mainTheme', () => {
  it('should work', () => {
    expect(mainTheme).toMatchInlineSnapshot(`
      {
        "animation": {
          "clock-loading": e {
            "id": "sc-keyframes-jbxmNs",
            "inject": [Function],
            "name": "jbxmNs",
            "rules": "0%{stroke-dashoffset:82;}100%{stroke-dashoffset:0;}",
          },
        },
        "breakpoints": {
          "lg": 1024,
          "md": 768,
          "sm": 375,
          "xl": 1440,
        },
        "colors": {
          "black": "#000000",
          "blue": "#00235B",
          "green": "#98DFD6",
          "orange": "#B04B2F",
          "white": "#FBFBFB",
          "yellow": "#FFDD83",
        },
        "fontStyles": {
          "robotoMono": {
            "light": [
              "font-family:",
              "'Roboto mono', monospace",
              ";font-weight:300;",
            ],
            "medium": [
              "font-family:",
              "'Roboto mono', monospace",
              ";font-weight:500;",
            ],
            "regular": [
              "font-family:",
              "'Roboto mono', monospace",
              ";font-weight:400;",
            ],
            "thin": [
              "font-family:",
              "'Roboto mono', monospace",
              ";font-weight:100;",
            ],
          },
        },
        "fonts": {
          "baseSize": 20,
          "bodyFont": "'Roboto mono', monospace",
        },
        "helpers": {
          "noLinkUnderline": [
            "&:hover,&:active,&:focus{text-decoration:none;}",
          ],
          "textBottomBorder": {
            "afterIncrease": [
              "&::after{",
              "transform:scaleX(1);transform-origin:bottom left;",
              "}",
            ],
            "afterInitial": [Function],
            "afterShared": [
              "position:relative;&::after{content:'';position:absolute;width:100%;height:2px;bottom:0;left:0;background-color:",
              [Function],
              ";}",
            ],
            "removeBorder": [
              "&::after{content:none;}",
            ],
            "transform": [Function],
          },
        },
        "logo": {
          "component": {
            "$$typeof": Symbol(react.forward_ref),
            "render": [Function],
          },
          "svg": "slLogo.svg",
        },
        "media": {
          "down": {
            "lg": "@media (max-width: 1023px)",
            "md": "@media (max-width: 767px)",
            "sm": "@media (max-width: 374px)",
            "xl": "@media (max-width: 1439px)",
          },
          "up": {
            "lg": "@media (min-width: 1024px)",
            "md": "@media (min-width: 768px)",
            "sm": "@media (min-width: 375px)",
            "xl": "@media (min-width: 1440px)",
          },
        },
        "spacing": {
          "verticalSpacer": {
            "large": 70,
            "small": 50,
          },
        },
        "typography": {
          "body": {
            "L": [
              "font-family:",
              "'Roboto mono', monospace",
              ";font-weight:400;",
              " color:",
              "#FBFBFB",
              ";font-size:",
              "1rem",
              ";line-height:normal;",
            ],
            "M": [
              "font-family:",
              "'Roboto mono', monospace",
              ";font-weight:400;",
              " color:",
              "#FBFBFB",
              ";font-size:",
              "0.9rem",
              ";line-height:normal;",
            ],
            "S": [
              "font-family:",
              "'Roboto mono', monospace",
              ";font-weight:400;",
              " color:",
              "#FBFBFB",
              ";font-size:",
              "0.8rem",
              ";line-height:normal;",
            ],
            "XS": [
              "font-family:",
              "'Roboto mono', monospace",
              ";font-weight:500;",
              " color:",
              "#FBFBFB",
              ";font-size:",
              "0.55rem",
              ";line-height:normal;",
            ],
          },
          "heading": {
            "heading1": [
              "font-family:",
              "'Roboto mono', monospace",
              ";font-weight:400;",
              " color:",
              "#FBFBFB",
              ";font-size:",
              "3rem",
              ";line-height:normal;",
            ],
            "heading2": [
              "font-family:",
              "'Roboto mono', monospace",
              ";font-weight:400;",
              " color:",
              "#FBFBFB",
              ";font-size:",
              "1.5rem",
              ";line-height:normal;",
            ],
          },
          "label": {
            "L": [
              "font-family:",
              "'Roboto mono', monospace",
              ";font-weight:500;",
              " color:",
              "#FBFBFB",
              ";font-size:",
              "1rem",
              ";line-height:normal;text-transform:uppercase;",
            ],
            "XS": [
              "font-family:",
              "'Roboto mono', monospace",
              ";font-weight:500;",
              " color:",
              "#FBFBFB",
              ";font-size:",
              "0.5rem",
              ";line-height:normal;text-transform:uppercase;",
            ],
          },
        },
        "zIndex": {
          "modal": 200,
        },
      }
    `)
  })

  it('should create the correct noLinkUnderline', () => {
    expect(mainTheme.helpers.noLinkUnderline).toMatchInlineSnapshot(`
      [
        "&:hover,&:active,&:focus{text-decoration:none;}",
      ]
    `)
  })

  it('should create the correct textBottomBorder helpers', () => {
    const StyledTestItem = styled.div`
      ${mainTheme.helpers.textBottomBorder.afterShared}
      ${mainTheme.helpers.textBottomBorder.transform(0.5)}
    `
    const { baseElement } = render(
      <ThemeProvider theme={mainTheme}>
        <StyledTestItem />
      </ThemeProvider>
    )

    expect(baseElement).toMatchInlineSnapshot(`
      .c0 {
        position: relative;
      }

      .c0::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 2px;
        bottom: 0;
        left: 0;
        background-color: #FBFBFB;
      }

      .c0::after {
        transform: scaleX(0);
        transform-origin: bottom right;
        transition: transform 0.5s ease-out;
      }

      .c0:hover::after {
        transform: scaleX(1);
        transform-origin: bottom left;
      }

      <body>
        <div>
          <div
            class="c0"
          />
        </div>
      </body>
    `)

    expect(mainTheme.helpers.textBottomBorder.afterInitial())
      .toMatchInlineSnapshot(`
      [
        "&::after{transform:scaleX(0);transform-origin:bottom right;transition:transform ",
        "0.25",
        "s ease-out;}",
      ]
    `)

    expect(mainTheme.helpers.textBottomBorder.afterInitial(0.5))
      .toMatchInlineSnapshot(`
      [
        "&::after{transform:scaleX(0);transform-origin:bottom right;transition:transform ",
        "0.5",
        "s ease-out;}",
      ]
    `)

    expect(mainTheme.helpers.textBottomBorder.afterShared)
      .toMatchInlineSnapshot(`
      [
        "position:relative;&::after{content:'';position:absolute;width:100%;height:2px;bottom:0;left:0;background-color:",
        [Function],
        ";}",
      ]
    `)
    expect(mainTheme.helpers.textBottomBorder.transform())
      .toMatchInlineSnapshot(`
      [
        "&::after{transform:scaleX(0);transform-origin:bottom right;transition:transform ",
        "0.25",
        "s ease-out;}",
        " &:hover::after{",
        "transform:scaleX(1);transform-origin:bottom left;",
        "}",
      ]
    `)
  })
})
