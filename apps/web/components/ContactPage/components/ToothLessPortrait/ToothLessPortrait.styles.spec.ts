import { generateKeyframeStep, getDelay } from './ToothLessPortrait.styles'

describe('ToothLessPortraitStyles', () => {
  const images = ['1', '2', '3']
  const props = {
    images,
    totalImagesDelay: getDelay(images.length - 1),
  }

  it.each`
    index
    ${0}
    ${1}
    ${2}
  `('generate keyframe snapshot for image $index', ({ index }) => {
    expect(generateKeyframeStep({ ...props, index }).join('')).toMatchSnapshot()
  })
})

describe('getWeightedDelay', () => {
  //TODO
})

describe('getDelay', () => {
  //TODO
})

describe('getAdditiveBackgroundUrl', () => {
  //TODO
})
