import { cloudinaryTransform } from './transformUrl'

describe('cloudinaryTransform', () => {
  it('inserts delivery transforms after /image/upload/', () => {
    expect(
      cloudinaryTransform(
        'https://res.cloudinary.com/demo/image/upload/v123/waypoint_a.jpg',
        'f_auto,q_auto,w_640',
      ),
    ).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_640/v123/waypoint_a.jpg',
    )
  })

  it('returns non-Cloudinary URLs untouched', () => {
    expect(
      cloudinaryTransform('https://cdn.example.com/photo.jpg', 'f_auto,q_auto'),
    ).toBe('https://cdn.example.com/photo.jpg')
  })

  it('leaves already-transformed URLs untouched (idempotent)', () => {
    const url =
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_640/v123/a.jpg'
    expect(cloudinaryTransform(url, 'f_auto,q_auto,w_320')).toBe(url)
  })
})
