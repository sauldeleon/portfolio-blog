/**
 * @jest-environment node
 */
const mockConfig = jest.fn()
const mockExecute = jest.fn()
const mockSearch = {
  expression: jest.fn().mockReturnThis(),
  sort_by: jest.fn().mockReturnThis(),
  max_results: jest.fn().mockReturnThis(),
  next_cursor: jest.fn().mockReturnThis(),
  execute: mockExecute,
}
const mockUploaderDestroy = jest.fn()
const mockUploaderRename = jest.fn()

jest.mock('cloudinary', () => ({
  v2: {
    config: mockConfig,
    search: mockSearch,
    uploader: {
      destroy: mockUploaderDestroy,
      rename: mockUploaderRename,
    },
  },
}))

const { listImages, destroyImage, renameImage } = require('./images') as {
  listImages: (
    nextCursor?: string,
    maxResults?: number,
    search?: string,
  ) => Promise<{
    images: import('./images').CloudinaryImage[]
    nextCursor?: string
  }>
  destroyImage: (publicId: string) => Promise<void>
  renameImage: (
    publicId: string,
    newName: string,
  ) => Promise<import('./images').CloudinaryImage>
}

const mockResource = {
  public_id: 'sawl.dev - blog/sample',
  secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  width: 800,
  height: 600,
  format: 'jpg',
  created_at: '2024-01-01T00:00:00Z',
  bytes: 12345,
}

describe('listImages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud'
    process.env.CLOUDINARY_API_KEY = 'test-key'
    process.env.CLOUDINARY_API_SECRET = 'test-secret'
  })

  it('configures cloudinary with env vars', async () => {
    mockExecute.mockResolvedValue({ resources: [] })
    await listImages()
    expect(mockConfig).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    })
  })

  it('calls search with correct expression and sort', async () => {
    mockExecute.mockResolvedValue({ resources: [] })
    await listImages()
    expect(mockSearch.expression).toHaveBeenCalledWith(
      'folder:"sawl.dev - blog"',
    )
    expect(mockSearch.sort_by).toHaveBeenCalledWith('created_at', 'desc')
    expect(mockSearch.max_results).toHaveBeenCalledWith(50)
    expect(mockSearch.next_cursor).not.toHaveBeenCalled()
  })

  it('calls search with custom maxResults', async () => {
    mockExecute.mockResolvedValue({ resources: [] })
    await listImages(undefined, 100)
    expect(mockSearch.max_results).toHaveBeenCalledWith(100)
  })

  it('uses search expression when search term provided', async () => {
    mockExecute.mockResolvedValue({ resources: [] })
    await listImages(undefined, undefined, 'mountain')
    expect(mockSearch.expression).toHaveBeenCalledWith(
      'folder:"sawl.dev - blog" AND filename:mountain*',
    )
  })

  it('lowercases the search term in the expression', async () => {
    mockExecute.mockResolvedValue({ resources: [] })
    await listImages(undefined, undefined, 'Mountain')
    expect(mockSearch.expression).toHaveBeenCalledWith(
      'folder:"sawl.dev - blog" AND filename:mountain*',
    )
  })

  it('uses base expression when search term is not provided', async () => {
    mockExecute.mockResolvedValue({ resources: [] })
    await listImages(undefined, undefined, undefined)
    expect(mockSearch.expression).toHaveBeenCalledWith(
      'folder:"sawl.dev - blog"',
    )
  })

  it('passes next_cursor when nextCursor param is provided', async () => {
    mockExecute.mockResolvedValue({ resources: [] })
    await listImages('cursor-abc-123')
    expect(mockSearch.next_cursor).toHaveBeenCalledWith('cursor-abc-123')
  })

  it('does not call next_cursor when nextCursor is undefined', async () => {
    mockExecute.mockResolvedValue({ resources: [] })
    await listImages(undefined)
    expect(mockSearch.next_cursor).not.toHaveBeenCalled()
  })

  it('maps response to CloudinaryImage array', async () => {
    mockExecute.mockResolvedValue({ resources: [mockResource] })
    const result = await listImages()
    expect(result.images).toEqual([
      {
        publicId: 'sawl.dev - blog/sample',
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        width: 800,
        height: 600,
        format: 'jpg',
        createdAt: '2024-01-01T00:00:00Z',
        bytes: 12345,
      },
    ])
  })

  it('returns nextCursor when Cloudinary provides one', async () => {
    mockExecute.mockResolvedValue({
      resources: [mockResource],
      next_cursor: 'cursor-xyz-456',
    })
    const result = await listImages()
    expect(result.nextCursor).toBe('cursor-xyz-456')
  })

  it('returns undefined nextCursor when Cloudinary provides no more pages', async () => {
    mockExecute.mockResolvedValue({ resources: [mockResource] })
    const result = await listImages()
    expect(result.nextCursor).toBeUndefined()
  })

  it('propagates errors from search', async () => {
    mockExecute.mockRejectedValue(new Error('Cloudinary error'))
    await expect(listImages()).rejects.toThrow('Cloudinary error')
  })
})

describe('destroyImage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud'
    process.env.CLOUDINARY_API_KEY = 'test-key'
    process.env.CLOUDINARY_API_SECRET = 'test-secret'
  })

  it('configures cloudinary with env vars', async () => {
    mockUploaderDestroy.mockResolvedValue({ result: 'ok' })
    await destroyImage('sawl.dev - blog/sample')
    expect(mockConfig).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    })
  })

  it('calls uploader.destroy with publicId', async () => {
    mockUploaderDestroy.mockResolvedValue({ result: 'ok' })
    await destroyImage('sawl.dev - blog/sample')
    expect(mockUploaderDestroy).toHaveBeenCalledWith('sawl.dev - blog/sample')
  })

  it('propagates errors from uploader.destroy', async () => {
    mockUploaderDestroy.mockRejectedValue(new Error('Destroy failed'))
    await expect(destroyImage('sawl.dev - blog/sample')).rejects.toThrow(
      'Destroy failed',
    )
  })
})

describe('renameImage', () => {
  const mockRenameResult = {
    public_id: 'sawl.dev - blog/new-name',
    secure_url: 'https://res.cloudinary.com/demo/image/upload/new-name.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    created_at: '2024-01-01T00:00:00Z',
    bytes: 12345,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud'
    process.env.CLOUDINARY_API_KEY = 'test-key'
    process.env.CLOUDINARY_API_SECRET = 'test-secret'
  })

  it('configures cloudinary with env vars', async () => {
    mockUploaderRename.mockResolvedValue(mockRenameResult)
    await renameImage('sawl.dev - blog/sample', 'new-name')
    expect(mockConfig).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    })
  })

  it('calls uploader.rename with old and new publicId preserving folder', async () => {
    mockUploaderRename.mockResolvedValue(mockRenameResult)
    await renameImage('sawl.dev - blog/sample', 'new-name')
    expect(mockUploaderRename).toHaveBeenCalledWith(
      'sawl.dev - blog/sample',
      'sawl.dev - blog/new-name',
    )
  })

  it('uses new name directly when publicId has no folder', async () => {
    mockUploaderRename.mockResolvedValue({
      ...mockRenameResult,
      public_id: 'new-name',
    })
    await renameImage('sample', 'new-name')
    expect(mockUploaderRename).toHaveBeenCalledWith('sample', 'new-name')
  })

  it('maps rename response to CloudinaryImage', async () => {
    mockUploaderRename.mockResolvedValue(mockRenameResult)
    const result = await renameImage('sawl.dev - blog/sample', 'new-name')
    expect(result).toEqual({
      publicId: 'sawl.dev - blog/new-name',
      url: 'https://res.cloudinary.com/demo/image/upload/new-name.jpg',
      width: 800,
      height: 600,
      format: 'jpg',
      createdAt: '2024-01-01T00:00:00Z',
      bytes: 12345,
    })
  })

  it('propagates errors from uploader.rename', async () => {
    mockUploaderRename.mockRejectedValue(new Error('Rename failed'))
    await expect(
      renameImage('sawl.dev - blog/sample', 'new-name'),
    ).rejects.toThrow('Rename failed')
  })
})

export {}
