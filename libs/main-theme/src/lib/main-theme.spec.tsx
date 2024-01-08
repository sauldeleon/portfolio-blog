import { mainTheme } from './main-theme'

describe('mainTheme', () => {
  it('should work', () => {
    expect(mainTheme).toMatchSnapshot()
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
