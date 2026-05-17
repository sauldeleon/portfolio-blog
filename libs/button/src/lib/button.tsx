import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react'

import {
  StyledContainedButton,
  StyledGhostButton,
  StyledInvertedButton,
  StyledLabelButton,
  StyledTextButton,
} from './button.styles'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  active?: boolean
  variant?: 'text' | 'contained' | 'inverted' | 'label' | 'ghost'
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { active = false, children, variant = 'text', size = 'md', ...props },
    forwardedRef,
  ) => {
    if (variant === 'contained') {
      return (
        <StyledContainedButton $size={size} {...props} ref={forwardedRef}>
          {children}
        </StyledContainedButton>
      )
    }
    if (variant === 'inverted') {
      return (
        <StyledInvertedButton $size={size} {...props} ref={forwardedRef}>
          {children}
        </StyledInvertedButton>
      )
    }
    if (variant === 'label') {
      return (
        <StyledLabelButton {...props} ref={forwardedRef} $active={active}>
          {children}
        </StyledLabelButton>
      )
    }
    if (variant === 'ghost') {
      return (
        <StyledGhostButton $size={size} {...props} ref={forwardedRef}>
          {children}
        </StyledGhostButton>
      )
    }
    return (
      <StyledTextButton {...props} ref={forwardedRef}>
        {children}
      </StyledTextButton>
    )
  },
)
