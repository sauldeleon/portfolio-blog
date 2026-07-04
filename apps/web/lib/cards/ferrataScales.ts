import type { ScaleLevel } from './canyonScales'
import type { Lang } from './theme'

/** Localised copy for the interactive via-ferrata difficulty popover. */
export interface FerrataScaleContent {
  ui: {
    difficulty: string
    source: string
  }
  levels: ScaleLevel[]
}

/**
 * The Hüsler K-scale (K1–K6) of via-ferrata difficulty, keyed by language. Each
 * level is condensed to a single line for the interactive explain-on-click
 * popover.
 */
export const FERRATA_SCALES: Record<Lang, FerrataScaleContent> = {
  es: {
    ui: {
      difficulty: 'Escala de dificultad',
      source: 'Escala K (Hüsler)',
    },
    levels: [
      {
        key: 'K1',
        grade: 'K1',
        name: 'Muy fácil',
        desc: 'Tramos mayoritariamente horizontales o con ligera pendiente. Pocos elementos verticales. Para familias o debutantes.',
      },
      {
        key: 'K2',
        grade: 'K2',
        name: 'Fácil',
        desc: 'Introduce pasos verticales suaves. Buen equipamiento. Ideal como primera toma de contacto seria con una vía ferrata.',
      },
      {
        key: 'K3',
        grade: 'K3',
        name: 'Moderada',
        desc: 'Requiere condición física media. Algunos pasos exigentes, buena exposición, y presencia de puentes o tramos aéreos.',
      },
      {
        key: 'K4',
        grade: 'K4',
        name: 'Difícil',
        desc: 'Se requiere fuerza de brazos y resistencia. Tramos verticales o extraplomados. Menor número de peldaños; exige técnica.',
      },
      {
        key: 'K5',
        grade: 'K5',
        name: 'Muy difícil',
        desc: 'Esfuerzo físico alto, exposición elevada, zonas extraplomadas prolongadas. No recomendable sin experiencia previa.',
      },
      {
        key: 'K6',
        grade: 'K6',
        name: 'Extremadamente difícil',
        desc: 'Reservado para personas expertas, buena forma física y mental. Exposición máxima y pasos técnicos.',
      },
    ],
  },
  en: {
    ui: {
      difficulty: 'Difficulty scale',
      source: 'K scale (Hüsler)',
    },
    levels: [
      {
        key: 'K1',
        grade: 'K1',
        name: 'Very easy',
        desc: 'Mostly horizontal or gently sloping sections. Few vertical elements. Suitable for families or beginners.',
      },
      {
        key: 'K2',
        grade: 'K2',
        name: 'Easy',
        desc: 'Introduces gentle vertical sections. Well equipped. Ideal as a first serious taste of via ferrata.',
      },
      {
        key: 'K3',
        grade: 'K3',
        name: 'Moderate',
        desc: 'Requires average fitness. Some demanding sections, notable exposure, and bridges or aerial traverses.',
      },
      {
        key: 'K4',
        grade: 'K4',
        name: 'Difficult',
        desc: 'Needs arm strength and endurance. Vertical or overhanging sections. Fewer rungs; technique required.',
      },
      {
        key: 'K5',
        grade: 'K5',
        name: 'Very difficult',
        desc: 'High physical effort, high exposure, prolonged overhanging zones. Not advisable without prior experience.',
      },
      {
        key: 'K6',
        grade: 'K6',
        name: 'Extremely difficult',
        desc: 'Reserved for experts with good physical and mental fitness. Maximum exposure and technical moves.',
      },
    ],
  },
}
