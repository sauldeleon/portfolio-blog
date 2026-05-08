import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react'

import {
  StyledContainedButton,
  StyledInvertedButton,
  StyledTextButton,
} from './button.styles'

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & { variant?: 'text' | 'contained' | 'inverted' }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'text', ...props }, forwardedRef) => {
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
    return (
      <StyledTextButton {...props} ref={forwardedRef}>
        {children}
      </StyledTextButton>
    )
  },
)
