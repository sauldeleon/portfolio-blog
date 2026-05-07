import * as React from 'react'
import type { SVGProps } from 'react'
import { Ref, forwardRef } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const CloseIcon = (
  { title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth={4}
    ref={ref}
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <line x1={20} y1={20} x2={44} y2={44} />
    <line x1={44} y1={20} x2={20} y2={44} />
    <rect x={8} y={8} width={48} height={48} />
  </svg>
)
const ForwardRef = forwardRef(CloseIcon)
export { ForwardRef as ReactComponent }
