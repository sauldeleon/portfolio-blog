/**
 * @jest-environment node
 */
const mockConfig = jest.fn()
const mockApiResources = jest.fn()
const mockUploaderDestroy = jest.fn()
const mockUploaderRename = jest.fn()

jest.mock('cloudinary', () => ({
  v2: {
    config: mockConfig,
    api: { resources: mockApiResources },
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
    mockApiResources.mockResolvedValue({ resources: [] })
    await listImages()
    expect(mockConfig).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    })
  })

  it('calls api.resources with correct params (default)', async () => {
    mockApiResources.mockResolvedValue({ resources: [] })
    await listImages()
    expect(mockApiResources).toHaveBeenCalledWith({
      type: 'upload',
      resource_type: 'image',
      prefix: 'sawl.dev - blog/',
      max_results: 20,
    })
  })

  it('calls api.resources with custom maxResults', async () => {
    mockApiResources.mockResolvedValue({ resources: [] })
    await listImages(undefined, 50)
    expect(mockApiResources).toHaveBeenCalledWith({
      type: 'upload',
      resource_type: 'image',
      prefix: 'sawl.dev - blog/',
      max_results: 50,
    })
  })

  it('passes next_cursor when nextCursor param is provided', async () => {
    mockApiResources.mockResolvedValue({ resources: [] })
    await listImages('cursor-abc-123')
    expect(mockApiResources).toHaveBeenCalledWith({
      type: 'upload',
      resource_type: 'image',
      prefix: 'sawl.dev - blog/',
      max_results: 20,
      next_cursor: 'cursor-abc-123',
    })
  })

  it('does not include next_cursor when nextCursor is undefined', async () => {
    mockApiResources.mockResolvedValue({ resources: [] })
    await listImages(undefined)
    const callArg = mockApiResources.mock.calls[0][0] as Record<string, unknown>
    expect(callArg).not.toHaveProperty('next_cursor')
  })

  it('maps response to CloudinaryImage array', async () => {
    mockApiResources.mockResolvedValue({ resources: [mockResource] })
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
    mockApiResources.mockResolvedValue({
      resources: [mockResource],
      next_cursor: 'cursor-xyz-456',
    })
    const result = await listImages()
    expect(result.nextCursor).toBe('cursor-xyz-456')
  })

  it('returns undefined nextCursor when Cloudinary provides no more pages', async () => {
    mockApiResources.mockResolvedValue({ resources: [mockResource] })
    const result = await listImages()
    expect(result.nextCursor).toBeUndefined()
  })

  it('propagates errors from api.resources', async () => {
    mockApiResources.mockRejectedValue(new Error('Cloudinary error'))
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
