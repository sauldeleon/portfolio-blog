import * as React from 'react'
import type { SVGProps } from 'react'
import { Ref, forwardRef } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const CanyoningIcon = (
  { title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 256 256"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    ref={ref}
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    {/* Head */}
    <circle cx="70" cy="36" r="20" />
    {/* Body — person leaning back, feet on rock face */}
    <path d="M70,56 L90,63 L98,54 L112,46 L109,56 L96,68 L148,120 L170,146 L176,168 L162,174 L150,154 L130,122 L56,70 Z" />
    {/* Rope going up to anchor top-right */}
    <path d="M108,51 L230,4 L228,12 L106,58 Z" />
    {/* Rope tail hanging down from belay device */}
    <path d="M140,118 Q126,162 102,196 Q86,222 82,252 L90,254 Q94,224 110,198 Q135,164 148,120 Z" />
    {/* Rock face — main body */}
    <path d="M154,0 C163,42 144,78 153,114 C160,142 143,168 151,196 C157,218 145,240 149,256 L256,256 L256,0 Z" />
    {/* Rock texture strip 1 */}
    <path d="M180,0 C174,42 186,78 180,114 C174,142 186,168 180,196 C174,218 184,240 178,256 L192,256 C198,240 189,218 194,196 C200,168 189,142 194,114 C200,78 189,42 194,0 Z" />
    {/* Rock texture strip 2 */}
    <path d="M208,0 C202,42 214,78 208,114 C202,142 214,168 208,196 C202,218 212,240 206,256 L220,256 C226,240 217,218 222,196 C228,168 217,142 222,114 C228,78 217,42 222,0 Z" />
    {/* Rock texture strip 3 */}
    <path d="M235,0 C229,42 241,78 235,114 C229,142 241,168 235,196 C229,218 239,240 233,256 L247,256 C253,240 244,218 249,196 C255,168 244,142 249,114 C255,78 244,42 249,0 Z" />
  </svg>
)
const ForwardRef = forwardRef(CanyoningIcon)
export { ForwardRef as ReactComponent }
