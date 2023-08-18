beforeAll(() => {
  let cont = 0
  jest.spyOn(global.Math, 'random').mockImplementation(() => {
    return ++cont / 10e15
  })
})
