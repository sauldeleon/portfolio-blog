import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react'

import {
  StyledContainedButton,
  StyledInvertedButton,
  StyledLabelButton,
  StyledTextButton,
} from './button.styles'

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & { active?: boolean; variant?: 'text' | 'contained' | 'inverted' | 'label' }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ active = false, children, variant = 'text', ...props }, forwardedRef) => {
    if (variant === 'contained') {
      return (
        <StyledContainedButton {...props} ref={forwardedRef}>
          {children}
        </StyledContainedButton>
      )
    }
    if (variant === 'inverted') {
      return (
        <StyledInvertedButton {...props} ref={forwardedRef}>
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
    return (
      <StyledTextButton {...props} ref={forwardedRef}>
        {children}
      </StyledTextButton>
    )
  },
)
