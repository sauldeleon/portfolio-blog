import type { Lang } from './theme'

/** One row of a canyoning grade scale (verticality / aquatic / commitment). */
export interface ScaleLevel {
  /** Token as it appears in the card grade, e.g. `v4`, `a3`, `III`. */
  key: string
  /** Display grade, e.g. `V4`, `a3`, `III`. */
  grade: string
  /** Difficulty name (empty for commitment, which has no per-level name). */
  name: string
  /** Condensed one-line description of the level. */
  desc: string
}

/** Localised copy for the interactive canyon-summary popovers. */
export interface CanyonScaleContent {
  ui: {
    verticality: string
    aquatic: string
    commitment: string
    flow: string
    phenomena: string
    affectsRappels: string
    source: string
    /** Hint shown under the card inviting the reader to click the zones. */
    hint: string
  }
  vert: ScaleLevel[]
  aqua: ScaleLevel[]
  commit: ScaleLevel[]
  /** Phenomenon key → condensed explanation (labels live in STRINGS.phenomena). */
  phenomenaDesc: Record<string, string>
}

/**
 * Condensed FFME/FSS canyoning difficulty scales, keyed by language. The full
 * tables carry far more detail than fits a card; each level is summarised to a
 * single line for the interactive explain-on-click popovers.
 */
export const CANYON_SCALES: Record<Lang, CanyonScaleContent> = {
  es: {
    ui: {
      verticality: 'Escala de verticalidad',
      aquatic: 'Escala acuática',
      commitment: 'Escala de compromiso',
      flow: 'Caudal observado',
      phenomena: 'Fenómeno observado',
      affectsRappels: 'Afectación a los rápeles',
      source: 'Escala FFME/FSS',
      hint: 'Toca las zonas resaltadas de la tarjeta para descubrir qué significan',
    },
    vert: [
      {
        key: 'v1',
        grade: 'V1',
        name: 'Muy fácil',
        desc: 'Sin rápeles; cuerda innecesaria. Sin escaladas ni destrepes.',
      },
      {
        key: 'v2',
        grade: 'V2',
        name: 'Fácil',
        desc: 'Rápeles fáciles menores de 10 m. Destrepes sencillos y poco expuestos.',
      },
      {
        key: 'v3',
        grade: 'V3',
        name: 'Poco difícil',
        desc: 'Rápeles simples menores de 30 m; pasamanos simples; destrepes hasta 3c.',
      },
      {
        key: 'v4',
        grade: 'V4',
        name: 'Bastante difícil',
        desc: 'Rápeles mayores de 30 m o con caudal; reuniones cómodas; hasta 4c/A0.',
      },
      {
        key: 'v5',
        grade: 'V5',
        name: 'Difícil',
        desc: 'Caudal medio a fuerte; reuniones aéreas; pasos hasta 5c/A1.',
      },
      {
        key: 'v6',
        grade: 'V6',
        name: 'Muy difícil, expuesto',
        desc: 'Caudal fuerte; anclajes naturales delicados; pasos hasta 6a/A2.',
      },
      {
        key: 'v7',
        grade: 'V7',
        name: 'Extremadamente difícil, muy expuesto',
        desc: 'Caudal muy fuerte; gestión experta; más de 6a/A2; pasos en apnea.',
      },
    ],
    aqua: [
      {
        key: 'a1',
        grade: 'a1',
        name: 'Muy fácil',
        desc: 'Ausencia de agua o agua en calma. Natación opcional.',
      },
      {
        key: 'a2',
        grade: 'a2',
        name: 'Fácil',
        desc: 'Natación en calma menor de 10 m; saltos menores de 3 m; toboganes cortos.',
      },
      {
        key: 'a3',
        grade: 'a3',
        name: 'Poco difícil',
        desc: 'Natación menor de 30 m; corriente débil; saltos de 3 a 5 m.',
      },
      {
        key: 'a4',
        grade: 'a4',
        name: 'Bastante difícil',
        desc: 'Permanencias largas; corriente media; saltos 5-8 m; sifón menor de 1 m.',
      },
      {
        key: 'a5',
        grade: 'a5',
        name: 'Difícil',
        desc: 'Corrientes fuertes; aguas vivas puntuales; saltos 8-10 m; sifón hasta 2 m.',
      },
      {
        key: 'a6',
        grade: 'a6',
        name: 'Muy difícil',
        desc: 'Corrientes que dificultan nadar; drosages y rebufos; saltos 10-14 m; sifón hasta 3 m.',
      },
      {
        key: 'a7',
        grade: 'a7',
        name: 'Extremadamente difícil',
        desc: 'Corrientes muy fuertes; movimientos violentos; saltos de más de 14 m; sifón de más de 3 m.',
      },
    ],
    commit: [
      {
        key: 'I',
        grade: 'I',
        name: '',
        desc: 'Escapatorias a lo largo de todo el recorrido. Total inferior a 2 h.',
      },
      {
        key: 'II',
        grade: 'II',
        name: '',
        desc: 'A salvo de una crecida en ¼ h; escapatorias en ½ h. Total de 2 a 4 h.',
      },
      {
        key: 'III',
        grade: 'III',
        name: '',
        desc: 'A salvo en ½ h; escapatorias en 1 h. Total de 4 a 8 h.',
      },
      {
        key: 'IV',
        grade: 'IV',
        name: '',
        desc: 'A salvo en 1 h; escapatorias en 2 h. Total de 8 h a 1 día.',
      },
      {
        key: 'V',
        grade: 'V',
        name: '',
        desc: 'A salvo en 2 h; escapatorias en 4 h. Total de 1 a 2 días.',
      },
      {
        key: 'VI',
        grade: 'VI',
        name: '',
        desc: 'A salvo en más de 2 h; escapatorias a más de 4 h. Total de más de 2 días.',
      },
    ],
    phenomenaDesc: {
      backwash:
        'Recirculación bajo cascadas y rápeles que puede atrapar al barranquista.',
      current:
        'Corriente en las pozas que empuja y desvía la trayectoria de nado.',
      murky: 'Agua turbia con poca o nula visibilidad bajo el agua.',
      siphon:
        'Paso donde el agua se sume bajo la roca; riesgo de atrapamiento.',
      recent_rain: 'Terreno y caudal alterados tras lluvias recientes.',
      none: 'Sin fenómenos de aguas vivas apreciables.',
    },
  },
  en: {
    ui: {
      verticality: 'Verticality scale',
      aquatic: 'Aquatic scale',
      commitment: 'Commitment scale',
      flow: 'Observed flow',
      phenomena: 'Observed phenomenon',
      affectsRappels: 'Effect on the rappels',
      source: 'FFME/FSS scale',
      hint: 'Tap the highlighted areas of the card to discover what they mean',
    },
    vert: [
      {
        key: 'v1',
        grade: 'V1',
        name: 'Very easy',
        desc: 'No rappels; rope not needed. No climbing or downclimbing.',
      },
      {
        key: 'v2',
        grade: 'V2',
        name: 'Easy',
        desc: 'Easy rappels under 10 m. Simple, low-exposure downclimbs.',
      },
      {
        key: 'v3',
        grade: 'V3',
        name: 'Slightly difficult',
        desc: 'Simple rappels under 30 m; simple handlines; downclimbs to 3c.',
      },
      {
        key: 'v4',
        grade: 'V4',
        name: 'Fairly difficult',
        desc: 'Rappels over 30 m or with flow; comfortable belays; to 4c/A0.',
      },
      {
        key: 'v5',
        grade: 'V5',
        name: 'Difficult',
        desc: 'Medium to strong flow; airy belays; moves to 5c/A1.',
      },
      {
        key: 'v6',
        grade: 'V6',
        name: 'Very difficult, exposed',
        desc: 'Strong flow; delicate natural anchors; moves to 6a/A2.',
      },
      {
        key: 'v7',
        grade: 'V7',
        name: 'Extremely difficult, very exposed',
        desc: 'Very strong flow; expert management; beyond 6a/A2; apnea moves.',
      },
    ],
    aqua: [
      {
        key: 'a1',
        grade: 'a1',
        name: 'Very easy',
        desc: 'No water or calm water. Swimming optional.',
      },
      {
        key: 'a2',
        grade: 'a2',
        name: 'Easy',
        desc: 'Calm swims under 10 m; jumps under 3 m; short slides.',
      },
      {
        key: 'a3',
        grade: 'a3',
        name: 'Slightly difficult',
        desc: 'Swims under 30 m; weak current; jumps of 3 to 5 m.',
      },
      {
        key: 'a4',
        grade: 'a4',
        name: 'Fairly difficult',
        desc: 'Long immersions; medium current; jumps 5-8 m; siphon under 1 m.',
      },
      {
        key: 'a5',
        grade: 'a5',
        name: 'Difficult',
        desc: 'Strong currents; local white water; jumps 8-10 m; siphon up to 2 m.',
      },
      {
        key: 'a6',
        grade: 'a6',
        name: 'Very difficult',
        desc: 'Currents that hamper swimming; drossages and backwash; jumps 10-14 m; siphon up to 3 m.',
      },
      {
        key: 'a7',
        grade: 'a7',
        name: 'Extremely difficult',
        desc: 'Very strong currents; violent water; jumps over 14 m; siphon over 3 m.',
      },
    ],
    commit: [
      {
        key: 'I',
        grade: 'I',
        name: '',
        desc: 'Escape routes along the whole descent. Total under 2 h.',
      },
      {
        key: 'II',
        grade: 'II',
        name: '',
        desc: 'Safe from a flood within ¼ h; escapes within ½ h. Total 2 to 4 h.',
      },
      {
        key: 'III',
        grade: 'III',
        name: '',
        desc: 'Safe within ½ h; escapes within 1 h. Total 4 to 8 h.',
      },
      {
        key: 'IV',
        grade: 'IV',
        name: '',
        desc: 'Safe within 1 h; escapes within 2 h. Total 8 h to 1 day.',
      },
      {
        key: 'V',
        grade: 'V',
        name: '',
        desc: 'Safe within 2 h; escapes within 4 h. Total 1 to 2 days.',
      },
      {
        key: 'VI',
        grade: 'VI',
        name: '',
        desc: 'Safe in over 2 h; escapes beyond 4 h. Total over 2 days.',
      },
    ],
    phenomenaDesc: {
      backwash: 'Recirculating water below drops that can trap the canyoneer.',
      current: 'Current in pools that pushes and diverts your swimming line.',
      murky: 'Murky water with little to no underwater visibility.',
      siphon: 'Passage where water sinks under rock; entrapment risk.',
      recent_rain: 'Terrain and flow altered by recent rainfall.',
      none: 'No noticeable white-water phenomena.',
    },
  },
}
