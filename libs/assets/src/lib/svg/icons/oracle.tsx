import * as React from 'react'
import type { SVGProps } from 'react'
import { Ref, forwardRef } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const OracleIcon = (
  { title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    fill="currentColor"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M21.272 22.141h-10.538c-3.338-0.070-6.017-2.793-6.017-6.141s2.679-6.071 6.011-6.141l0.007-0h10.538c0.003 0 0.007 0 0.011 0 3.391 0 6.141 2.749 6.141 6.141s-2.749 6.141-6.141 6.141c-0.004 0-0.008 0-0.012 0h0.001zM21.513 6.518h-11.022c-5.234 0.004-9.474 4.248-9.474 9.482 0 5.231 4.235 9.472 9.463 9.482h11.033c5.231-0.008 9.469-4.25 9.469-9.482s-4.238-9.474-9.468-9.482h-0.001z" />
  </svg>
)
const ForwardRef = forwardRef(OracleIcon)
export { ForwardRef as ReactComponent }
