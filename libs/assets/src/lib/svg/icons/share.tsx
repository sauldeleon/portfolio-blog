import * as React from 'react'
import type { SVGProps } from 'react'
import { Ref, forwardRef } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const ShareIcon = (
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
    <circle cx={7} cy={12} r={2} stroke="currentColor" strokeLinejoin="round" />
    <circle cx={17} cy={6} r={2} stroke="currentColor" strokeLinejoin="round" />
    <path d="M15 7L8.5 11" stroke="currentColor" />
    <circle
      cx={17}
      cy={18}
      r={2}
      stroke="currentColor"
      strokeLinejoin="round"
    />
    <path d="M8.5 13.5L15 17" stroke="currentColor" />
  </svg>
)
const ForwardRef = forwardRef(ShareIcon)
export { ForwardRef as ReactComponent }
