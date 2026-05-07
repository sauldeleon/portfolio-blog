import * as React from 'react'
import type { SVGProps } from 'react'
import { Ref, forwardRef } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const HalfLifeIcon = (
  { title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 364.707 364.707"
    ref={ref}
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      d="M223.864,272.729l-38.608-97.848l-56.603,89.184H93.166l79.052-127.654l-8.875-25.229h-30.781V81.12h52.691 l60.521,153.899l26.608-8.668l8.867,29.813L223.864,272.729z"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth={34}
      d="M337.623,182.198c0,85.579-69.363,154.934-154.934,154.934 c-85.571,0-154.936-69.354-154.936-154.934c0-85.569,69.363-154.933,154.936-154.933C268.259,27.265,337.623,96.629,337.623,182.198 z"
    />
  </svg>
)
const ForwardRef = forwardRef(HalfLifeIcon)
export { ForwardRef as ReactComponent }
