import {
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
} from 'react'

import {
  StyledFieldGroup,
  StyledHelper,
  StyledInput,
  StyledLabel,
  StyledRequiredMarker,
  StyledTextarea,
} from './input.styles'

export function FieldGroup(props: HTMLAttributes<HTMLDivElement>) {
  return <StyledFieldGroup {...props} />
}

export interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function FieldLabel({ required, children, ...props }: FieldLabelProps) {
  return (
    <StyledLabel {...props}>
      {children}
      {required && (
        <StyledRequiredMarker aria-hidden="true">*</StyledRequiredMarker>
      )}
    </StyledLabel>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <StyledInput {...props} />
}

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => <StyledTextarea {...props} ref={ref} />)
Textarea.displayName = 'Textarea'

export function FieldHelper(props: HTMLAttributes<HTMLParagraphElement>) {
  return <StyledHelper {...props} />
}
