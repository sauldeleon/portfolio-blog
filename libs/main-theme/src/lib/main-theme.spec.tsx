import { mainTheme } from './main-theme'

describe('mainTheme', () => {
  it('should work', () => {
    expect(mainTheme).toMatchInlineSnapshot(`
      {
        "animation": {
          "clockLoading": e {
            "id": "sc-keyframes-jbxmNs",
            "inject": [Function],
            "name": "jbxmNs",
            "rules": "0%{stroke-dashoffset:82;}100%{stroke-dashoffset:0;}",
          },
          "colorSwap": e {
            "id": "sc-keyframes-jQopbU",
            "inject": [Function],
            "name": "jQopbU",
            "rules": "from{color:#FFDD83;}to{color:#98DFD6;}",
          },
          "horizontalMovement": e {
            "id": "sc-keyframes-ehQbNZ",
            "inject": [Function],
            "name": "ehQbNZ",
            "rules": "0%{transform:translateX(calc(-50% - var(--itemSize)));}100%{transform:translateX(calc(50% + var(--itemSize)));}",
          },
          "moveToothFall": e {
            "id": "sc-keyframes-cpZUNP",
            "inject": [Function],
            "name": "cpZUNP",
            "rules": "0%{top:-30px;}100%{top:200%;}",
          },
          "moveToothHorizontal": e {
            "id": "sc-keyframes-ivkSzl",
            "inject": [Function],
            "name": "ivkSzl",
            "rules": "0%{left:0;}100%{left:-65%;}",
          },
          "moveToothRotate": e {
            "id": "sc-keyframes-beQuxy",
            "inject": [Function],
            "name": "beQuxy",
            "rules": "0%{transform:rotate(180deg);}100%{transform:rotate(900deg);}",
          },
          "moveToothVertical": e {
            "id": "sc-keyframes-iPepDc",
            "inject": [Function],
            "name": "iPepDc",
            "rules": "100%{top:var(--final-tooth-top);}",
          },
          "particleFade": e {
            "id": "sc-keyframes-itzSVh",
            "inject": [Function],
            "name": "itzSVh",
            "rules": "0%{opacity:1;}50%{opacity:0.7;}100%{opacity:1;}",
          },
          "particleMovement": e {
            "id": "sc-keyframes-iWWfjj",
            "inject": [Function],
            "name": "iWWfjj",
            "rules": "from{transform:translate(-50%,var(--begin-y));}to{transform:translate(50%,var(--end-y));}",
          },
          "particleScale": e {
            "id": "sc-keyframes-defYgy",
            "inject": [Function],
            "name": "defYgy",
            "rules": "0%{transform:scale3d(0.4,0.4,1);}50%{transform:scale3d(1,1,1);}100%{transform:scale3d(0.4,0.4,1);}",
          },
          "portalGlow": e {
            "id": "sc-keyframes-iDgGpj",
            "inject": [Function],
            "name": "iDgGpj",
            "rules": "0%{box-shadow:inset 0px 0px 13px 1px var(--portal-glow-color);}50%{box-shadow:inset 0px 0px 20px 1px var(--portal-glow-color);}100%{box-shadow:inset 0px 0px 13px 1px var(--portal-glow-color);}",
          },
          "rotateMovement": e {
            "id": "sc-keyframes-dOlMFI",
            "inject": [Function],
            "name": "dOlMFI",
            "rules": "from{rotate:0deg;}to{rotate:var(--rotation);}",
          },
          "toothRemove": e {
            "id": "sc-keyframes-jTSpTQ",
            "inject": [Function],
            "name": "jTSpTQ",
            "rules": "100%{opacity:1;}",
          },
          "verticalMovement": e {
            "id": "sc-keyframes-dPpvJG",
            "inject": [Function],
            "name": "dPpvJG",
            "rules": "0%{transform:translateY(var(--translateY-begin));}100%{transform:translateY(var(--translateY-end));}",
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
              "position:relative;&::after{content:'';position:absolute;width:100%;height:2px;bottom:0;left:0;background-color:currentColor;}",
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
            "lg": "@media (width <= 1023px)",
            "md": "@media (width <= 767px)",
            "sm": "@media (width <= 374px)",
            "xl": "@media (width <= 1439px)",
          },
          "up": {
            "lg": "@media (width >= 1024px)",
            "md": "@media (width >= 768px)",
            "sm": "@media (width >= 375px)",
            "xl": "@media (width >= 1440px)",
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
        "position:relative;&::after{content:'';position:absolute;width:100%;height:2px;bottom:0;left:0;background-color:currentColor;}",
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
