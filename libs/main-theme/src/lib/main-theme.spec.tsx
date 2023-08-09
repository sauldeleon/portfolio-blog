import { mainTheme } from './main-theme'

describe('mainTheme', () => {
  it('should work', () => {
    expect(mainTheme).toMatchInlineSnapshot(`
      {
        "animation": {
          "rotate360": e {
            "id": "sc-keyframes-bqrFYP",
            "inject": [Function],
            "name": "bqrFYP",
            "rules": "0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}",
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
          "white": "#FFFFFF",
          "yellow": "#FFDD83",
        },
        "fontStyles": {
          "robotoMono": {
            "light": [
              "font-family:",
              "'Roboto Mono', monospace",
              ";font-weight:300;",
            ],
            "medium": [
              "font-family:",
              "'Roboto Mono', monospace",
              ";font-weight:500;",
            ],
            "regular": [
              "font-family:",
              "'Roboto Mono', monospace",
              ";font-weight:400;",
            ],
            "thin": [
              "font-family:",
              "'Roboto Mono', monospace",
              ";font-weight:100;",
            ],
          },
        },
        "fonts": {
          "baseSize": 20,
          "bodyFont": "'Roboto Mono', monospace",
        },
        "helpers": {
          "noLinkUnderline": [
            "&:hover,&:active,&:focus{text-decoration:none;}",
          ],
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
              "'Roboto Mono', monospace",
              ";font-weight:400;",
              " color:",
              "#FFFFFF",
              ";font-size:",
              "1rem",
              ";line-height:normal;",
            ],
            "M": [
              "font-family:",
              "'Roboto Mono', monospace",
              ";font-weight:400;",
              " color:",
              "#FFFFFF",
              ";font-size:",
              "0.9rem",
              ";line-height:normal;",
            ],
            "S": [
              "font-family:",
              "'Roboto Mono', monospace",
              ";font-weight:400;",
              " color:",
              "#FFFFFF",
              ";font-size:",
              "0.8rem",
              ";line-height:normal;",
            ],
          },
          "heading": {
            "heading1": [
              "font-family:",
              "'Roboto Mono', monospace",
              ";font-weight:400;",
              " color:",
              "#FFFFFF",
              ";font-size:",
              "3rem",
              ";line-height:normal;",
            ],
            "heading2": [
              "font-family:",
              "'Roboto Mono', monospace",
              ";font-weight:400;",
              " color:",
              "#FFFFFF",
              ";font-size:",
              "1.5rem",
              ";line-height:normal;",
            ],
          },
          "label": {
            "L": [
              "font-family:",
              "'Roboto Mono', monospace",
              ";font-weight:500;",
              " color:",
              "#FFFFFF",
              ";font-size:",
              "1rem",
              ";line-height:normal;text-transform:uppercase;",
            ],
            "XS": [
              "font-family:",
              "'Roboto Mono', monospace",
              ";font-weight:500;",
              " color:",
              "#FFFFFF",
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
})
