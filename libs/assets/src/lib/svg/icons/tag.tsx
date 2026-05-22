import * as React from 'react'
import type { SVGProps } from 'react'
import { Ref, forwardRef } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const TagIcon = (
  { title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    ref={ref}
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M43.3 21.5l-17-17A3 3 0 0 0 24 3.6H8A4.4 4.4 0 0 0 3.6 8v16a3 3 0 0 0 .9 2.2l17 17a3.3 3.3 0 0 0 4.7 0l17-17a3.3 3.3 0 0 0 0-4.7zM14 18a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
  </svg>
)
const ForwardRef = forwardRef(TagIcon)
export { ForwardRef as ReactComponent }
