beforeAll(() => {
  // Deterministic but evenly spread (Park–Miller). Tiny, ever-growing values
  // sent source-map's randomised quicksort into its worst case, overflowing
  // the stack whenever a large file showed up in an error trace.
  let seed = 1
  vi.spyOn(global.Math, 'random').mockImplementation(() => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  })

  global.IntersectionObserver = vi.fn(function (
    callback: IntersectionObserverCallback,
  ) {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      callback,
    }
  }) as unknown as typeof IntersectionObserver
})
