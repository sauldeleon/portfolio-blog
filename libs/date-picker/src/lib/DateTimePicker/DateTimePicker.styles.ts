import styled from 'styled-components'

import { StyledDropdownPanel } from '@sdlgr/dropdown'

export const StyledWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`

export const StyledTrigger = styled.button<{ $hasValue: boolean }>`
  width: 100%;
  padding: 0.5rem 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(251, 251, 251, 0.2);
  color: ${({ $hasValue, theme }) =>
    $hasValue ? theme.colors.white : 'rgba(251,251,251,0.35)'};
  font-family: inherit;
  font-size: 0.8rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-bottom-color: rgba(251, 251, 251, 0.5);
  }

  &:focus-visible {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledPopover = styled(StyledDropdownPanel)`
  top: calc(100% + 4px);
  background: #111;
  padding: 1rem;
  min-width: 280px;

  --rdp-accent-color: ${({ theme }) => theme.colors.green};
  --rdp-accent-background-color: rgba(152, 223, 214, 0.12);
  --rdp-day-height: 2rem;
  --rdp-day-width: 2rem;
  --rdp-range-middle-background-color: rgba(152, 223, 214, 0.08);

  .rdp-root {
    color: ${({ theme }) => theme.colors.white};
  }

  .rdp-day_button {
    color: ${({ theme }) => theme.colors.white};
    border-radius: 2px;
  }

  .rdp-chevron {
    fill: ${({ theme }) => theme.colors.white};
  }

  .rdp-outside {
    opacity: 0.25;
  }

  .rdp-month_caption {
    font-size: 0.75rem;
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.colors.white};
  }

  .rdp-weekday {
    font-size: 0.6rem;
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(251, 251, 251, 0.4);
  }

  .rdp-nav button {
    color: ${({ theme }) => theme.colors.white};
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }
  }
`

export const StyledClearButton = styled.button`
  margin-top: 0.75rem;
  display: block;
  width: 100%;
  padding: 0.4rem;
  background: transparent;
  border: 1px solid rgba(251, 251, 251, 0.12);
  color: rgba(251, 251, 251, 0.5);
  font-family: inherit;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.orange};
    color: ${({ theme }) => theme.colors.orange};
  }
`
