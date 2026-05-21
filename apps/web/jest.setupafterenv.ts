beforeAll(() => {
  let cont = 0
  jest.spyOn(global.Math, 'random').mockImplementation(() => {
    return ++cont / 10e15
  })

  global.IntersectionObserver = jest.fn((callback) => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    callback,
  })) as unknown as typeof IntersectionObserver
})
