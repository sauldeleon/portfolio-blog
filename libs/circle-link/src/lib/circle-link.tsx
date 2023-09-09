import React from 'react'

import { LinkProps } from '@sdlgr/link'

import {
  StyledBody,
  StyledCircleLink,
  StyledIconContent,
  StyledIconWrapper,
  StyledLoadingCircleIcon,
} from './circle-link.styles'

export interface CircleLinkProps extends LinkProps {
  label?: React.ReactNode
  iconContent?: React.ReactNode
  iconSize?: number
}

export function CircleLink({
  label,
  iconContent,
  iconSize = 42,
  ref,
  ...rest
}: CircleLinkProps) {
  return (
    <StyledCircleLink $size={iconSize} {...rest}>
      <StyledIconWrapper $size={iconSize}>
        <StyledLoadingCircleIcon width={iconSize} height={iconSize} />
        {iconContent && <StyledIconContent>{iconContent}</StyledIconContent>}
      </StyledIconWrapper>
      {label && <StyledBody>{label}</StyledBody>}
    </StyledCircleLink>
  )
}
