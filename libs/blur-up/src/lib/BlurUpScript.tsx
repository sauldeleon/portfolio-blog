/**
 * Flags BlurUp images as loaded (`data-loaded`) the moment they load or fail.
 * Load events do not bubble but can be captured on the document, so one
 * listener covers every image, including those React adds later.
 */
export const BLUR_UP_SCRIPT =
  "(function(){function m(e){var t=e.target;if(t&&t.tagName==='IMG'&&t.hasAttribute('data-blur-up'))t.setAttribute('data-loaded','')}document.addEventListener('load',m,true);document.addEventListener('error',m,true)})()"

/**
 * Goes in the page's <head>, before any BlurUp image is parsed, so no load
 * event is missed. Without JavaScript the images are simply shown.
 */
export function BlurUpScript() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BLUR_UP_SCRIPT }} />
      <noscript>
        <style>{'img[data-blur-up]{opacity:1!important}'}</style>
      </noscript>
    </>
  )
}
