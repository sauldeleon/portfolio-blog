import * as React from 'react'
import type { SVGProps } from 'react'
import { Ref, forwardRef } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const AngularJSIcon = (
  { title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 540 540"
    ref={ref}
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M270,163.21l44.739,104.795H270v-0.001h-44.74L270,163.21L270,163.21z M504.369,98.337L469.437,412.72L270,525.5 L70.563,412.721L35.631,98.336L270,14.5v0.001L504.369,98.337z M419.535,387.77L270,59.414v-0.001L120.465,387.77h55.891 l28.943-75.852L270,310.92l64.7,0.998l28.942,75.852H419.535z" />
  </svg>
)
const ForwardRef = forwardRef(AngularJSIcon)
export { ForwardRef as ReactComponent }
