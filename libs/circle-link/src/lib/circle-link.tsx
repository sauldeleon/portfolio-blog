import React from 'react'

import {
  StyledBody,
  StyledCircleButtonIcon,
  StyledCircleLink,
  StyledIconContent,
  StyledIconWrapper,
} from './circle-link.styles'

export interface CircleLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  label?: React.ReactNode
  iconContent?: React.ReactNode
  iconSize?: number
}

export function CircleLink({
  label,
  iconContent,
  iconSize = 42,
  ...rest
}: CircleLinkProps) {
  return (
    <StyledCircleLink $size={iconSize} {...rest}>
      <StyledIconWrapper $size={iconSize}>
        <StyledCircleButtonIcon width={iconSize} height={iconSize} />
        {iconContent && <StyledIconContent>{iconContent}</StyledIconContent>}
      </StyledIconWrapper>
      {label && <StyledBody>{label}</StyledBody>}
    </StyledCircleLink>
  )
}
