import * as React from 'react'
import type { SVGProps } from 'react'
import { Ref, forwardRef } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const PanoramicIcon = (
  { title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 7h6v10H2V7zm1 1h4v8H3V8zm6-1h6v10H9V7zm1 1h4v8h-4V8zm6-1h6v10h-6V7zm1 1h4v8h-4V8z"
      fill="currentColor"
    />
  </svg>
)
const ForwardRef = forwardRef(PanoramicIcon)
export { ForwardRef as ReactComponent }
