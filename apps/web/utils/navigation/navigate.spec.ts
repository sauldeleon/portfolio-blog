import { navigateTo } from './navigate'

describe('navigateTo', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('uses window.location by default', () => {
    navigateTo('#admin-posts')

    expect(window.location.hash).toBe('#admin-posts')
  })

  it('supports injecting a navigation target', () => {
    const assign = jest.fn()
    const location = { assign }

    navigateTo('/admin/posts', location)

    expect(assign).toHaveBeenCalledWith('/admin/posts')
  })
})
