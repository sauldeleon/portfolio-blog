import styled from 'styled-components'

export const StyledComboboxWrapper = styled.div`
  width: 100%;

  .combobox__control {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    border-bottom: 1px solid rgba(251, 251, 251, 0.2);
    padding: 0.375rem 0;
    cursor: text;
    transition: border-color 0.2s;

    &:hover {
      border-bottom-color: ${({ theme }) => theme.colors.green};
    }

    &.combobox__control--is-focused {
      border-bottom-color: ${({ theme }) => theme.colors.green};
    }
  }

  .combobox__value-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    padding: 0;
    flex: 1;
  }

  .combobox__multi-value {
    display: flex;
    align-items: center;
    background: rgba(251, 251, 251, 0.1);
    border: 1px solid rgba(251, 251, 251, 0.15);
    border-radius: 2px;
    margin: 0;
  }

  .combobox__multi-value__label {
    color: ${({ theme }) => theme.colors.white};
    font-family: inherit;
    font-size: 0.75rem;
    padding: 0.15rem 0.25rem 0.15rem 0.4rem;
  }

  .combobox__multi-value__remove {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.5;
    padding: 0.15rem 0.35rem;
    cursor: pointer;
    display: flex;
    align-items: center;

    &:hover {
      background: transparent;
      color: ${({ theme }) => theme.colors.white};
      opacity: 1;
    }
  }

  .combobox__input-container {
    color: ${({ theme }) => theme.colors.white};
    font-family: inherit;
    font-size: 0.875rem;
    margin: 0;
    padding: 0;
    text-align: left;

    input {
      text-align: left;
    }
  }

  .combobox__placeholder {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.25;
    font-family: inherit;
    font-size: 0.875rem;
    margin: 0;
  }

  .combobox__indicators {
    display: none;
  }

  .combobox__menu {
    background: ${({ theme }) => theme.colors.black};
    border: 1px solid rgba(251, 251, 251, 0.12);
    border-radius: 2px;
    margin-top: 2px;
    z-index: 100;
  }

  .combobox__menu-list {
    padding: 0;
  }

  .combobox__option {
    color: ${({ theme }) => theme.colors.white};
    font-family: inherit;
    font-size: 0.8rem;
    opacity: 0.7;
    cursor: pointer;
    padding: 0.5rem 0.75rem;

    &.combobox__option--is-focused {
      background: rgba(251, 251, 251, 0.05);
      opacity: 1;
    }

    &.combobox__option--is-selected {
      background: rgba(152, 223, 214, 0.06);
      color: ${({ theme }) => theme.colors.green};
      opacity: 1;
    }
  }

  .combobox__no-options-message {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.3;
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
`
