import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react'

import { StyledContainedButton, StyledTextButton } from './button.styles'

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & { variant?: 'text' | 'contained' }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'text', ...props }, forwardedRef) => {
    return variant === 'text' ? (
      <StyledTextButton {...props} ref={forwardedRef}>
        {children}
      </StyledTextButton>
    ) : (
      <StyledContainedButton {...props} ref={forwardedRef}>
        {children}
      </StyledContainedButton>
    )
  },
)
