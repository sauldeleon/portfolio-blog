import { AMBER } from './theme'

export type IconKind =
  | 'refugio'
  | 'fuente'
  | 'cruce'
  | 'info'
  | 'cascada'
  | 'summit'
  | 'alert'
  | 'glacier'
  | 'route'
  | 'climb'
  | 'descent'
  | 'hiker'
  | 'pause'
  | 'clock'
  | 'sunrise'
  | 'sunset'
  | 'ferrata'
  | 'cable'
  | 'vertical'
  | 'canyon'
  | 'rappel'
  | 'drops'
  | 'return'
  | 'ph_backwash'
  | 'ph_current'
  | 'ph_murky'
  | 'ph_siphon'
  | 'ph_rain'
  | 'ph_none'
  | 'poza'
  | 'slide'
  | 'downclimb'

export function iconPath(kind: IconKind, sw = 5.4): string {
  const c = `fill="none" stroke="${AMBER}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`
  const paths: Record<IconKind, string> = {
    refugio: `<path d="M50 14 L18 84 L82 84 Z" ${c}/><path d="M42 84 L42 58 A8 8 0 0 1 58 58 L58 84" ${c}/><path d="M34 50 L66 50" ${c} stroke-opacity="0.7"/>`,
    fuente: `<path d="M50 14 C58 36 80 52 80 66 A30 30 0 1 1 20 66 C20 52 42 36 50 14 Z" ${c}/><path d="M40 64 A12 12 0 0 0 56 76" ${c} stroke-opacity="0.85"/>`,
    cruce: `<path d="M50 14 L50 92" ${c}/><path d="M50 26 L80 26 L88 37 L80 48 L50 48 Z" ${c}/><path d="M50 56 L20 56 L12 67 L20 78 L50 78 Z" ${c}/><path d="M38 92 L62 92" ${c}/>`,
    info: `<circle cx="50" cy="50" r="36" ${c}/><circle cx="50" cy="33" r="2.2" fill="${AMBER}" stroke="${AMBER}" stroke-width="5.2"/><path d="M50 46 L50 70" ${c}/>`,
    cascada: `<path d="M14 28 L86 28" ${c}/><path d="M30 32 C26 46 34 56 30 72" ${c}/><path d="M50 32 C46 46 54 56 50 72" ${c}/><path d="M70 32 C66 46 74 56 70 72" ${c}/><path d="M22 82 Q34 90 46 83" ${c} stroke-opacity="0.85"/><path d="M56 83 Q68 90 80 82" ${c} stroke-opacity="0.85"/>`,
    summit: `<path d="M20 84 L52 30 L84 84 Z" ${c}/><path d="M52 30 L44 48 L60 60" ${c} stroke-opacity="0.8"/><path d="M52 30 L52 12" ${c}/><path d="M52 12 L70 17 L52 22" ${c}/>`,
    alert: `<path d="M50 18 L88 82 L12 82 Z" ${c}/><path d="M50 42 L50 64" ${c}/><circle cx="50" cy="73" r="1.6" fill="${AMBER}" stroke="${AMBER}" stroke-width="4.6"/>`,
    glacier: `<path d="M10 70 L30 50 L46 64 L64 44 L90 70 Z" ${c}/><path d="M10 70 L90 70" ${c}/><path d="M22 82 Q34 90 46 83 M56 83 Q68 90 80 82" ${c} stroke-opacity="0.8"/>`,
    route: `<path d="M16 80 C36 80 34 52 50 52 C66 52 64 24 84 24" ${c}/><circle cx="16" cy="80" r="6" ${c}/><circle cx="84" cy="24" r="6" fill="${AMBER}" stroke="${AMBER}"/>`,
    climb: `<path d="M8 82 L34 44 L50 62 L70 30 L92 82" ${c}/><path d="M70 30 L70 14 M62 22 L70 14 L78 22" ${c}/>`,
    descent: `<path d="M8 82 L34 44 L50 62 L70 30 L92 82" ${c}/><path d="M70 14 L70 30 M62 22 L70 30 L78 22" ${c}/>`,
    hiker: `<circle cx="50" cy="18" r="8" ${c}/><path d="M52 27 L44 54" ${c}/><path d="M44 54 L34 84 M44 54 L60 80" ${c}/><path d="M49 38 L66 46" ${c}/><path d="M68 28 L72 86" ${c}/>`,
    pause: `<circle cx="50" cy="50" r="35" ${c}/><path d="M42 36 L42 64 M58 36 L58 64" ${c}/>`,
    clock: `<circle cx="50" cy="50" r="35" ${c}/><path d="M50 50 L50 30 M50 50 L65 59" ${c}/>`,
    sunrise: `<path d="M14 74 L86 74" ${c}/><path d="M32 74 A18 18 0 0 1 68 74" ${c}/><path d="M50 22 L50 8 M44 14 L50 8 L56 14" ${c}/><path d="M16 56 L22 50 M84 56 L78 50" ${c} stroke-opacity="0.8"/>`,
    sunset: `<path d="M14 74 L86 74" ${c}/><path d="M32 74 A18 18 0 0 1 68 74" ${c}/><path d="M50 8 L50 22 M44 16 L50 22 L56 16" ${c}/><path d="M16 50 L22 56 M84 50 L78 56" ${c} stroke-opacity="0.8"/>`,
    ferrata: `<path d="M32 12 L32 88 M68 12 L68 88" ${c}/><path d="M32 26 L68 26 M32 44 L68 44 M32 62 L68 62 M32 80 L68 80" ${c}/>`,
    cable: `<path d="M16 36 C42 64 58 64 84 36" ${c}/><path d="M16 28 L16 46 M84 28 L84 46" ${c}/>`,
    vertical: `<path d="M50 14 L50 86" ${c}/><path d="M40 24 L50 14 L60 24 M40 76 L50 86 L60 76" ${c}/>`,
    canyon: `<path d="M22 12 C28 38 30 58 40 86" ${c}/><path d="M78 12 C72 38 70 58 60 86" ${c}/><path d="M34 74 Q50 86 66 74" ${c} stroke-opacity="0.9"/><path d="M40 64 Q50 72 60 64" ${c} stroke-opacity="0.5"/>`,
    rappel: `<path d="M28 16 L72 16 M50 16 L50 58" ${c}/><path d="M50 58 L40 78 L60 78 Z" ${c}/>`,
    drops: `<path d="M28 24 L50 40 L72 24 M28 48 L50 64 L72 48 M28 72 L50 88 L72 72" ${c}/>`,
    return: `<path d="M62 34 L40 34 A18 18 0 0 0 40 70 L58 70" ${c}/><path d="M48 26 L40 34 L48 42" ${c}/>`,
    ph_backwash: `<path d="M22 50 A28 28 0 1 1 54 78" ${c}/><path d="M40 50 A14 14 0 1 0 54 64" ${c}/>`,
    ph_current: `<path d="M14 42 Q30 30 46 42 T78 42" ${c}/><path d="M14 64 Q30 52 46 64 T78 64" ${c}/>`,
    ph_murky: `<path d="M50 16 C58 38 78 52 78 66 A28 28 0 1 1 22 66 C22 52 42 38 50 16 Z" ${c}/><circle cx="42" cy="66" r="3.4" fill="${AMBER}"/><circle cx="58" cy="58" r="3.4" fill="${AMBER}"/>`,
    ph_siphon: `<path d="M50 14 L50 54 M40 44 L50 54 L60 44" ${c}/><path d="M26 60 A24 24 0 0 0 74 60" ${c}/>`,
    ph_rain: `<path d="M34 54 A15 15 0 0 1 62 50 A13 13 0 0 1 64 76 L36 76 A14 14 0 0 1 34 54 Z" ${c}/><path d="M40 82 L36 92 M52 82 L48 92 M64 82 L60 92" ${c}/>`,
    ph_none: `<path d="M26 52 L44 70 L74 30" ${c}/>`,
    poza: `<path d="M16 60 Q50 46 84 60 Q50 86 16 60 Z" ${c}/><path d="M36 60 Q50 53 64 60" ${c} stroke-opacity="0.6"/><path d="M50 16 C55 28 62 35 62 43 A12 12 0 1 1 38 43 C38 35 45 28 50 16 Z" ${c}/>`,
    slide: `<circle cx="26" cy="20" r="6" ${c}/><path d="M26 28 C26 60 74 52 74 82" ${c}/><path d="M66 74 L74 86 L82 74" ${c}/>`,
    downclimb: `<path d="M16 20 L16 40 L42 40 L42 60 L68 60 L68 80 L88 80" ${c}/><path d="M28 62 L28 88 M20 80 L28 88 L36 80" ${c}/>`,
  }
  return paths[kind] ?? paths['info']
}
