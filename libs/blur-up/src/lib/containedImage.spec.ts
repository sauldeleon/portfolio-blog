import { isOnContainedImage } from './containedImage'

function image(natural: [number, number], box: [number, number]) {
  const img = document.createElement('img')
  Object.defineProperty(img, 'naturalWidth', { value: natural[0] })
  Object.defineProperty(img, 'naturalHeight', { value: natural[1] })
  img.getBoundingClientRect = () =>
    ({ left: 10, top: 20, width: box[0], height: box[1] }) as DOMRect
  return img
}

describe('isOnContainedImage', () => {
  it('counts the whole box until the image has loaded', () => {
    expect(isOnContainedImage(image([0, 0], [300, 100]), 0, 0)).toBe(true)
  })

  it('tells the picture from the bands beside it', () => {
    // 100x100 contained in 300x100 at (10, 20): picture spans x 110-210.
    const img = image([100, 100], [300, 100])
    expect(isOnContainedImage(img, 160, 70)).toBe(true)
    expect(isOnContainedImage(img, 50, 70)).toBe(false)
    expect(isOnContainedImage(img, 260, 70)).toBe(false)
  })

  it('tells the picture from the bands above and below it', () => {
    // 200x100 contained in 200x300 at (10, 20): picture spans y 120-220.
    const img = image([200, 100], [200, 300])
    expect(isOnContainedImage(img, 100, 170)).toBe(true)
    expect(isOnContainedImage(img, 100, 60)).toBe(false)
    expect(isOnContainedImage(img, 100, 280)).toBe(false)
  })
})
