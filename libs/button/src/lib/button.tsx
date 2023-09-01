import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react'

import { StyledButton } from './button.styles'

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <StyledButton {...props} ref={forwardedRef}>
        {children}
      </StyledButton>
    )
  }
)
