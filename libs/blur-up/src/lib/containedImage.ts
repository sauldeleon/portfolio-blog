/**
 * Whether a point falls on the picture of an `object-fit: contain` image, as
 * opposed to the empty bands around it. Lets a lightbox whose image fills a
 * fixed frame still close on a click beside the picture. Until the image has
 * loaded its size is unknown, so the whole box counts as picture.
 */
export function isOnContainedImage(
  image: HTMLImageElement,
  clientX: number,
  clientY: number,
): boolean {
  const { naturalWidth, naturalHeight } = image
  if (!naturalWidth || !naturalHeight) return true
  const box = image.getBoundingClientRect()
  const scale = Math.min(box.width / naturalWidth, box.height / naturalHeight)
  const width = naturalWidth * scale
  const height = naturalHeight * scale
  const left = box.left + (box.width - width) / 2
  const top = box.top + (box.height - height) / 2
  return (
    clientX >= left &&
    clientX <= left + width &&
    clientY >= top &&
    clientY <= top + height
  )
}
