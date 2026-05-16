/**
 * @jest-environment node
 */
const mockConfig = jest.fn()
const mockUpload = jest.fn()

jest.mock('cloudinary', () => ({
  v2: {
    config: mockConfig,
    uploader: { upload: mockUpload },
  },
}))

const { uploadImage } = require('./upload') as {
  uploadImage: (
    buffer: Buffer,
    mimeType: string,
    altText: string,
    name?: string,
  ) => Promise<import('./upload').UploadResult>
}

const mockCloudinaryResult = {
  secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  public_id: 'sawl.dev - blog/sample',
  width: 800,
  height: 600,
  format: 'jpg',
  created_at: '2024-01-01T00:00:00Z',
  bytes: 12345,
}

describe('uploadImage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud'
    process.env.CLOUDINARY_API_KEY = 'test-key'
    process.env.CLOUDINARY_API_SECRET = 'test-secret'
  })

  it('configures cloudinary with env vars', async () => {
    mockUpload.mockResolvedValue(mockCloudinaryResult)
    await uploadImage(Buffer.from('data'), 'image/jpeg', '')
    expect(mockConfig).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    })
  })

  it('uploads as data URI with correct folder', async () => {
    mockUpload.mockResolvedValue(mockCloudinaryResult)
    const buffer = Buffer.from('imgdata')
    await uploadImage(buffer, 'image/jpeg', 'alt text')
    expect(mockUpload).toHaveBeenCalledWith(
      `data:image/jpeg;base64,${buffer.toString('base64')}`,
      expect.objectContaining({
        folder: 'sawl.dev - blog',
        context: { alt: 'alt text' },
      }),
    )
  })

  it('returns mapped result', async () => {
    mockUpload.mockResolvedValue(mockCloudinaryResult)
    const result = await uploadImage(Buffer.from('x'), 'image/png', 'my alt')
    expect(result).toEqual({
      url: mockCloudinaryResult.secure_url,
      publicId: mockCloudinaryResult.public_id,
      width: 800,
      height: 600,
      format: 'jpg',
      createdAt: '2024-01-01T00:00:00Z',
      bytes: 12345,
      altText: 'my alt',
    })
  })

  it('passes public_id when name is provided', async () => {
    mockUpload.mockResolvedValue(mockCloudinaryResult)
    const buffer = Buffer.from('imgdata')
    await uploadImage(buffer, 'image/jpeg', 'alt text', 'my-custom-name')
    expect(mockUpload).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ public_id: 'my-custom-name' }),
    )
  })

  it('does not pass public_id when name is not provided', async () => {
    mockUpload.mockResolvedValue(mockCloudinaryResult)
    const buffer = Buffer.from('imgdata')
    await uploadImage(buffer, 'image/jpeg', 'alt text')
    expect(mockUpload).toHaveBeenCalledWith(
      expect.any(String),
      expect.not.objectContaining({ public_id: expect.anything() }),
    )
  })

  it('propagates cloudinary upload errors', async () => {
    mockUpload.mockRejectedValue(new Error('Cloudinary error'))
    await expect(
      uploadImage(Buffer.from('x'), 'image/jpeg', ''),
    ).rejects.toThrow('Cloudinary error')
  })
})

export {}
