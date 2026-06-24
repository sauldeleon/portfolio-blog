export const BG_TOP = '#152532'
export const BG_BOT = '#0E1820'
export const PANEL_STK = '#2C414F'
export const BADGE_BG = '#1E303C'
export const BONE = '#F4F0E6'
export const COLD = '#94A8B3'
export const AMBER = '#F4B83C'
export const AMBER_DK = '#C98A1E'
export const TRACK_BG = '#24384A'
export const CONTOUR = '#2E4654'

/** Difficulty colour for the observed-flow droplet, keyed by flow level. */
export const FLOW_COLORS: Record<string, string> = {
  dry: '#94A8B3',
  low: '#6FB1A0',
  normal: '#F4B83C',
  high: '#E08A3C',
  very_high: '#DB6A4A',
  flood: '#D9534F',
  unknown: '#94A8B3',
}

/** Ordered option keys for the structured flow inputs (form + card share these). */
export const FLOW_LEVEL_KEYS = [
  'dry',
  'low',
  'normal',
  'high',
  'very_high',
  'flood',
  'unknown',
] as const
export const FLOW_RAPPEL_KEYS = [
  'none',
  'some_water',
  'jet',
  'committed',
] as const
export const PHENOMENA_KEYS = [
  'backwash',
  'current',
  'murky',
  'siphon',
  'recent_rain',
  'none',
] as const

export const SCALE = 2

export const F_BOLD = 'Poppins'
export const MONO = 'Roboto Mono'

export type Lang = 'es' | 'en'

export const STRINGS = {
  es: {
    route_summary: 'RESUMEN DE RUTA',
    distance: 'DISTANCIA RECORRIDA',
    ascent: 'DESNIVEL + ACUMULADO',
    times_header: 'TIEMPOS Y HORARIOS',
    descent: 'DESNIVEL − ACUMULADO',
    moving: 'EN MOVIMIENTO',
    stopped: 'DETENIDO',
    total: 'TIEMPO TOTAL',
    start: 'HORA INICIO',
    end: 'HORA FINAL',
    profile: 'PERFIL DE ELEVACIÓN',
    difficulty: 'DIFICULTAD',
    cable: 'LONGITUD',
    vertical: 'DESNIVEL VERTICAL',
    max_rappel: 'RÁPEL MÁXIMO',
    rappels: 'Nº DE RÁPELES',
    return: 'RETORNO',
    g_vert: 'VERT',
    g_aqua: 'ACUÁT',
    g_commit: 'COMPR',
    desnivel: 'DESNIVEL',
    rope: 'CUERDA',
    flow: 'CAUDAL',
    season: 'ÉPOCA',
    approach: 'APROXIMACIÓN',
    in_canyon: 'EN EL BARRANCO',
    cars: 'COCHES',
    tech_header: 'FICHA TÉCNICA',
    canyon_card: 'BARRANCO',
    ferrata_card: 'VÍA FERRATA',
    default_title: 'Resumen de ruta',
    flow_levels: {
      dry: 'Seco / residual',
      low: 'Bajo',
      normal: 'Normal',
      high: 'Alto',
      very_high: 'Muy alto',
      flood: 'Crecida',
      unknown: 'Desconocido',
    },
    flow_rappels: {
      none: 'No afecta a los rápeles',
      some_water: 'Algunos rápeles tienen agua',
      jet: 'Rápeles con chorro / gestión de trayectoria',
      committed: 'Rápeles comprometidos o no practicables',
    },
    phenomena: {
      backwash: 'Rebufos / lavadoras',
      current: 'Corriente en pozas',
      murky: 'Agua turbia',
      siphon: 'Sifón activo',
      recent_rain: 'Cambios recientes tras lluvias',
      none: 'Ninguno apreciable',
    },
    months: [
      'ENE',
      'FEB',
      'MAR',
      'ABR',
      'MAY',
      'JUN',
      'JUL',
      'AGO',
      'SEP',
      'OCT',
      'NOV',
      'DIC',
    ],
    categories: {
      refugio: 'REFUGIO',
      fuente: 'FUENTE DE AGUA',
      cruce: 'CRUCE',
      info: 'PUNTO DE INTERÉS',
      cascada: 'CASCADA',
      summit: 'CUMBRE',
      alert: 'ZONA DELICADA',
      glacier: 'GLACIAR',
      rappel: 'RÁPEL',
      salto: 'SALTO',
      tobogan: 'TOBOGÁN',
      poza: 'POZA',
      destrepe: 'DESTREPE',
      ferrata: 'FERRATA',
      canyon: 'ENCAJONAMIENTO',
    },
  },
  en: {
    route_summary: 'ROUTE SUMMARY',
    distance: 'DISTANCE',
    ascent: 'TOTAL ASCENT',
    times_header: 'TIME BREAKDOWN',
    descent: 'TOTAL DESCENT',
    moving: 'MOVING TIME',
    stopped: 'STOPPED',
    total: 'TOTAL TIME',
    start: 'START TIME',
    end: 'END TIME',
    profile: 'ELEVATION PROFILE',
    difficulty: 'DIFFICULTY',
    cable: 'LENGTH',
    vertical: 'VERTICAL DROP',
    max_rappel: 'LONGEST RAPPEL',
    rappels: 'RAPPELS',
    return: 'RETURN',
    g_vert: 'VERT',
    g_aqua: 'AQUA',
    g_commit: 'COMM',
    desnivel: 'DESCENT',
    rope: 'ROPE',
    flow: 'FLOW',
    season: 'SEASON',
    approach: 'APPROACH',
    in_canyon: 'IN THE CANYON',
    cars: 'CARS',
    tech_header: 'TECH SHEET',
    canyon_card: 'CANYONING',
    ferrata_card: 'VIA FERRATA',
    default_title: 'Route summary',
    flow_levels: {
      dry: 'Dry / residual',
      low: 'Low',
      normal: 'Normal',
      high: 'High',
      very_high: 'Very high',
      flood: 'Flood',
      unknown: 'Unknown',
    },
    flow_rappels: {
      none: 'Does not affect the rappels',
      some_water: 'Some rappels have water',
      jet: 'Rappels with jet / trajectory management',
      committed: 'Committed or impassable rappels',
    },
    phenomena: {
      backwash: 'Backwash / washing machines',
      current: 'Current in pools',
      murky: 'Murky water',
      siphon: 'Active siphon',
      recent_rain: 'Recent changes after rain',
      none: 'None noticeable',
    },
    months: [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ],
    categories: {
      refugio: 'MOUNTAIN HUT',
      fuente: 'WATER SOURCE',
      cruce: 'JUNCTION',
      info: 'POINT OF INTEREST',
      cascada: 'WATERFALL',
      summit: 'SUMMIT',
      alert: 'HAZARD ZONE',
      glacier: 'GLACIER',
      rappel: 'RAPPEL',
      salto: 'JUMP',
      tobogan: 'SLIDE',
      poza: 'POOL',
      destrepe: 'DOWNCLIMB',
      ferrata: 'VIA FERRATA',
      canyon: 'NARROWS',
    },
  },
} as const

export type LangStrings = (typeof STRINGS)[Lang]
