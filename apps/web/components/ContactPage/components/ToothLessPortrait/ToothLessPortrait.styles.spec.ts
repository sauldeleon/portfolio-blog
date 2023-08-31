import {
  generateKeyframeStep,
  getAdditiveBackgroundUrl,
  getDelay,
  getWeightedDelay,
  swapImageAnimation,
} from './ToothLessPortrait.styles'

const images = ['1', '2', '3']
const props = {
  images,
  totalImagesDelay: getDelay(images.length - 1),
}
describe('generateKeyframeStep', () => {
  it.each`
    index
    ${0}
    ${1}
    ${2}
  `('generate keyframe step snapshot for image $index', ({ index }) => {
    expect(generateKeyframeStep({ ...props, index }).join('')).toMatchSnapshot()
  })
})

describe('swapImageAnimation', () => {
  it('generate keyframe snapshot for images', () => {
    expect(
      swapImageAnimation({
        ...props,
        images: [],
      })
    )
  })
  it('generate keyframe snapshot for images', () => {
    expect(swapImageAnimation(props)).toMatchSnapshot()
  })
})

describe('getDelay', () => {
  it.each`
    index | result
    ${0}  | ${5}
    ${1}  | ${10}
    ${2}  | ${20}
    ${3}  | ${30}
    ${4}  | ${50}
    ${5}  | ${70}
    ${6}  | ${110}
    ${7}  | ${150}
    ${8}  | ${230}
  `(
    'calculate delay based on recursive function for n=$index',
    ({ index, result }) => {
      expect(getDelay(index)).toEqual(result)
    }
  )
})

describe('getWeightedDelay', () => {
  it.each`
    delay  | totalDelay | result
    ${0}   | ${5}       | ${0}
    ${10}  | ${100}     | ${10}
    ${25}  | ${25}      | ${100}
    ${-25} | ${-500}    | ${5}
    ${25}  | ${0}       | ${0}
  `(
    'calculate weighted delay percentage for $delay delay with $totalDelay totalDelay',
    ({ delay, totalDelay, result }) => {
      expect(getWeightedDelay(delay, totalDelay)).toEqual(result)
    }
  )
})

describe('getAdditiveBackgroundUrl', () => {
  it.each`
    index | result
    ${0}  | ${'url(1)'}
    ${1}  | ${'url(1), url(2)'}
    ${2}  | ${'url(1), url(2), url(3)'}
    ${3}  | ${'url(1), url(2), url(3)'}
    ${-1} | ${''}
  `('generate additive background url', ({ index, result }) => {
    expect(getAdditiveBackgroundUrl(images, index)).toEqual(result)
  })
})
