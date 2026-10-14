import {
  StyledLayerButton,
  StyledLayerSwitcher,
} from './TileLayerSwitcher.styles'

export interface TileLayerOption {
  id: string
  label: string
}

export interface TileLayerSwitcherProps {
  providers: TileLayerOption[]
  activeIndex: number
  onChange: (index: number) => void
  /** Test ids become `${testIdPrefix}-${provider.id}`. */
  testIdPrefix?: string
}

/** Base-layer buttons floating over the top-right corner of a map. */
export function TileLayerSwitcher({
  providers,
  activeIndex,
  onChange,
  testIdPrefix = 'tile-provider',
}: TileLayerSwitcherProps) {
  return (
    <StyledLayerSwitcher data-testid="layer-switcher">
      {providers.map((provider, i) => (
        <StyledLayerButton
          key={provider.id}
          type="button"
          $active={i === activeIndex}
          onClick={() => onChange(i)}
          aria-pressed={i === activeIndex}
          data-testid={`${testIdPrefix}-${provider.id}`}
        >
          {provider.label}
        </StyledLayerButton>
      ))}
    </StyledLayerSwitcher>
  )
}
