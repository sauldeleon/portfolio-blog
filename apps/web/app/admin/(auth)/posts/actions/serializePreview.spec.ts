const mockSerialize = jest.fn()

jest.mock('next-mdx-remote/serialize', () => ({
  serialize: (...args: unknown[]) => mockSerialize(...args),
}))

const { serializePreview } =
  require('./serializePreview') as typeof import('./serializePreview')

describe('serializePreview', () => {
  it('calls serialize with the provided content', async () => {
    const fakeResult = {
      compiledSource: 'compiled',
      scope: {},
      frontmatter: {},
    }
    mockSerialize.mockResolvedValue(fakeResult)
    const result = await serializePreview('# Hello')
    expect(mockSerialize).toHaveBeenCalledWith('# Hello')
    expect(result).toEqual(fakeResult)
  })
})
