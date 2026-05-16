import styled from 'styled-components'

export const StyledSelectWrapper = styled.div`
  width: 100%;

  .select__control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(251, 251, 251, 0.2);
    padding: 0.5rem 0;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-bottom-color: ${({ theme }) => theme.colors.green};
    }

    &.select__control--is-focused {
      border-bottom-color: ${({ theme }) => theme.colors.green};
    }
  }

  .select__value-container {
    padding: 0;
    flex: 1;
  }

  .select__single-value {
    color: ${({ theme }) => theme.colors.white};
    font-family: inherit;
    font-size: 0.7rem;
    margin: 0;
  }

  .select__input-container {
    color: ${({ theme }) => theme.colors.white};
    font-family: inherit;
    font-size: 0.7rem;
    margin: 0;
    padding: 0;
  }

  .select__placeholder {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.25;
    font-family: inherit;
    font-size: 0.7rem;
    margin: 0;
  }

  .select__dropdown-indicator {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.3;
    padding: 0;
    transition:
      transform 0.15s,
      opacity 0.15s;

    &:hover {
      opacity: 0.7;
    }
  }

  .select__control--menu-is-open .select__dropdown-indicator {
    transform: rotate(180deg);
    opacity: 1;
  }

  .select__indicator-separator {
    display: none;
  }

  .select__menu {
    background: ${({ theme }) => theme.colors.black};
    border: 1px solid rgba(251, 251, 251, 0.1);
    border-radius: 2px;
    box-shadow: none;
    margin-top: 2px;
    z-index: 100;
  }

  .select__menu-list {
    padding: 0.25rem 0;
  }

  .select__option {
    color: ${({ theme }) => theme.colors.white};
    font-family: inherit;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.45rem 0.75rem;
    background: transparent;

    &.select__option--is-focused {
      background: rgba(251, 251, 251, 0.05);
    }

    &.select__option--is-selected {
      color: ${({ theme }) => theme.colors.green};
      background: rgba(152, 223, 214, 0.06);
    }

    &.select__option--is-disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
`
