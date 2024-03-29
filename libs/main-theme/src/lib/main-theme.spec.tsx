import { mainTheme } from './main-theme'

describe('mainTheme', () => {
  it('should work', () => {
    expect(mainTheme).toMatchSnapshot()
  })

  it('should create the correct noLinkUnderline', () => {
    expect(mainTheme.helpers.noLinkUnderline).toMatchSnapshot()
  })

  it('should create the correct textBottomBorder helpers', () => {
    expect(mainTheme.helpers.textBottomBorder.afterInitial()).toMatchSnapshot()

    expect(
      mainTheme.helpers.textBottomBorder.afterInitial(0.5),
    ).toMatchSnapshot()

    expect(mainTheme.helpers.textBottomBorder.afterShared).toMatchSnapshot()
    expect(mainTheme.helpers.textBottomBorder.transform()).toMatchSnapshot()
  })
})
