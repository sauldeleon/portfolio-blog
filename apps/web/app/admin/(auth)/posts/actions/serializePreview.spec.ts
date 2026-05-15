const mockSerialize = jest.fn()

jest.mock('next-mdx-remote/serialize', () => ({
  serialize: (...args: unknown[]) => mockSerialize(...args),
}))

jest.mock('rehype-pretty-code', () => ({}))
jest.mock('remark-gfm', () => ({}))

const { serializePreview } =
  require('./serializePreview') as typeof import('./serializePreview')

describe('serializePreview', () => {
  it('calls serialize with content, remark-gfm, and rehype-pretty-code options', async () => {
    const fakeResult = {
      compiledSource: 'compiled',
      scope: {},
      frontmatter: {},
    }
    mockSerialize.mockResolvedValue(fakeResult)
    const result = await serializePreview('# Hello')
    expect(mockSerialize).toHaveBeenCalledWith(
      '# Hello',
      expect.objectContaining({
        mdxOptions: expect.objectContaining({
          remarkPlugins: expect.any(Array),
          rehypePlugins: expect.any(Array),
        }),
      }),
    )
    expect(result).toEqual(fakeResult)
  })
})
