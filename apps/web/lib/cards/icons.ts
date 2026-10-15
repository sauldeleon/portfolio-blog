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
  | 'loop'
  | 'oneway'
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
  | 'arrow_left'
  | 'arrow_right'

/*
 * Icons are drawn on Phosphor's 256-unit grid in its duotone style: a 16-unit
 * stroke plus a 20% opacity fill for volume.
 *
 * PHOSPHOR entries are Phosphor Icons (duotone weight), used under the MIT
 * License — Copyright (c) 2023 Phosphor Icons — https://phosphoricons.com.
 * OWN entries cover canyoning and mountain concepts Phosphor lacks, drawn in
 * the same style.
 */
const PHOSPHOR: Partial<Record<IconKind, string>> = {
  // house-line
  refugio: `<path d="M216,116.69V216H152V152H104v64H40V116.69l82.34-82.35a8,8,0,0,1,11.32,0Z" opacity="0.2"/><path d="M240,208H224V136l2.34,2.34A8,8,0,0,0,237.66,127L139.31,28.68a16,16,0,0,0-22.62,0L18.34,127a8,8,0,0,0,11.32,11.31L32,136v72H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM48,120l80-80,80,80v88H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48Zm96,88H112V160h32Z"/>`,
  // drop
  fuente: `<path d="M208,144a80,80,0,0,1-160,0c0-72,80-128,80-128S208,72,208,144Z" opacity="0.2"/><path d="M174,47.75a254.19,254.19,0,0,0-41.45-38.3,8,8,0,0,0-9.18,0A254.19,254.19,0,0,0,82,47.75C54.51,79.32,40,112.6,40,144a88,88,0,0,0,176,0C216,112.6,201.49,79.32,174,47.75ZM128,216a72.08,72.08,0,0,1-72-72c0-57.23,55.47-105,72-118,16.53,13,72,60.75,72,118A72.08,72.08,0,0,1,128,216Zm55.89-62.66a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68Z"/>`,
  // signpost
  cruce: `<path d="M240,112l-33.62,37.35a8,8,0,0,1-5.94,2.65H40a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200.44a8,8,0,0,1,5.94,2.65Z" opacity="0.2"/><path d="M246,106.65,212.33,69.3A16,16,0,0,0,200.44,64H136V32a8,8,0,0,0-16,0V64H40A16,16,0,0,0,24,80v64a16,16,0,0,0,16,16h80v64a8,8,0,0,0,16,0V160h64.44a16,16,0,0,0,11.89-5.3L246,117.35A8,8,0,0,0,246,106.65ZM200.44,144H40V80H200.44l28.8,32Z"/>`,
  // info
  info: `<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M144,176a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176Zm88-48A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM124,96a12,12,0,1,0-12-12A12,12,0,0,0,124,96Z"/>`,
  // mountains
  summit: `<path d="M144,52a20,20,0,1,1,20,20A20,20,0,0,1,144,52Zm49.44,55.92a8,8,0,0,0-13.77,0l-33,55.75-21-35.67H50.35L8,200H248Z" opacity="0.2"/><path d="M164,80a28,28,0,1,0-28-28A28,28,0,0,0,164,80Zm0-40a12,12,0,1,1-12,12A12,12,0,0,1,164,40Zm90.88,155.92-54.56-92.08A15.87,15.87,0,0,0,186.55,96h0a15.85,15.85,0,0,0-13.76,7.84L146.63,148l-44.84-76.1a16,16,0,0,0-27.58,0L1.11,195.94A8,8,0,0,0,8,208H248a8,8,0,0,0,6.88-12.08ZM88,80l23.57,40H64.43ZM22,192l33-56h66l33,56Zm150.57,0-16.66-28.28L186.55,112,234,192Z"/>`,
  // warning
  alert: `<path d="M215.46,216H40.54C27.92,216,20,202.79,26.13,192.09L113.59,40.22c6.3-11,22.52-11,28.82,0l87.46,151.87C236,202.79,228.08,216,215.46,216Z" opacity="0.2"/><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"/>`,
  // path
  route: `<path d="M224,200a24,24,0,1,1-24-24A24,24,0,0,1,224,200Z" opacity="0.2"/><path d="M200,168a32.06,32.06,0,0,0-31,24H72a32,32,0,0,1,0-64h96a40,40,0,0,0,0-80H72a8,8,0,0,0,0,16h96a24,24,0,0,1,0,48H72a48,48,0,0,0,0,96h97a32,32,0,1,0,31-40Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,200,216Z"/>`,
  // trend-up
  loop: `<circle cx="128" cy="128" r="80" opacity="0.2"/><path d="M208 128 A80 80 0 1 1 184 71" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M180 36 L186 74 L148 80" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><circle cx="208" cy="128" r="14" fill="${AMBER}"/>`,
  oneway: `<circle cx="56" cy="196" r="28" opacity="0.2"/><circle cx="56" cy="196" r="24" fill="none" stroke="${AMBER}" stroke-width="16"/><path d="M78 182 C150 168 104 84 196 64" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round"/><path d="M160 44 L204 62 L180 104" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  climb: `<path d="M232,56v64L168,56Z" opacity="0.2"/><path d="M232,48H168a8,8,0,0,0-5.66,13.66L188.69,88,136,140.69l-34.34-34.35a8,8,0,0,0-11.32,0l-72,72a8,8,0,0,0,11.32,11.32L96,123.31l34.34,34.35a8,8,0,0,0,11.32,0L200,99.31l26.34,26.35A8,8,0,0,0,240,120V56A8,8,0,0,0,232,48Zm-8,52.69L187.31,64H224Z"/>`,
  // trend-down
  descent: `<path d="M232,128v64H168Z" opacity="0.2"/><path d="M235.06,120.61a8,8,0,0,0-8.72,1.73L200,148.69,141.66,90.34a8,8,0,0,0-11.32,0L96,124.69,29.66,58.34A8,8,0,0,0,18.34,69.66l72,72a8,8,0,0,0,11.32,0L136,107.31,188.69,160l-26.35,26.34A8,8,0,0,0,168,200h64a8,8,0,0,0,8-8V128A8,8,0,0,0,235.06,120.61ZM224,184H187.31L224,147.31Z"/>`,
  // person-simple-hike
  hiker: `<path d="M176,48a24,24,0,1,1-24-24A24,24,0,0,1,176,48ZM44,132l28,12L96,88,68,76Z" opacity="0.2"/><path d="M152,80a32,32,0,1,0-32-32A32,32,0,0,0,152,80Zm0-48a16,16,0,1,1-16,16A16,16,0,0,1,152,32Zm48,112v88a8,8,0,0,1-16,0V151.66c-25.75-2.25-34.35-15.52-42-27.36-2.85-4.39-5.56-8.57-9.13-12.19l-13.4,30.81,37.2,26.57A8,8,0,0,1,160,176v56a8,8,0,0,1-16,0V180.12l-31.07-22.2L79.34,235.19A8,8,0,0,1,72,240a7.84,7.84,0,0,1-3.19-.67,8,8,0,0,1-4.15-10.52L122.19,96.5a8,8,0,0,1,11-3.92,40.92,40.92,0,0,1,8,5.47c6.37,5.52,10.51,11.91,14.16,17.55,7.68,11.84,13.23,20.4,36.6,20.4A8,8,0,0,1,200,144ZM72,152a8,8,0,0,0,7.36-4.85l24-56a8,8,0,0,0-4.2-10.5l-28-12a8,8,0,0,0-10.5,4.2l-24,56a8,8,0,0,0,4.2,10.5l28,12A8,8,0,0,0,72,152ZM54.51,127.8,72.2,86.5l13.3,5.7L67.8,133.49Z"/>`,
  // pause-circle
  pause: `<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM112,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z"/>`,
  // clock
  clock: `<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/>`,
  // ladder-simple
  ferrata: `<path d="M192,32V224H64V32Z" opacity="0.2"/><path d="M192,24a8,8,0,0,0-8,8V64H72V32a8,8,0,0,0-16,0V224a8,8,0,0,0,16,0V192H184v32a8,8,0,0,0,16,0V32A8,8,0,0,0,192,24Zm-8,56v40H72V80ZM72,176V136H184v40Z"/>`,
  // arrows-down-up
  vertical: `<path d="M176,48V208H80V48Z" opacity="0.2"/><path d="M117.66,170.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L72,188.69V48a8,8,0,0,1,16,0V188.69l18.34-18.35A8,8,0,0,1,117.66,170.34Zm96-96-32-32a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L168,67.31V208a8,8,0,0,0,16,0V67.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z"/>`,
  // caret-double-down
  drops: `<path d="M208,56l-80,80L48,56Z" opacity="0.2"/><path d="M213.66,141.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,204.69l74.34-74.35a8,8,0,0,1,11.32,11.32Zm-171.32-80A8,8,0,0,1,48,48H208a8,8,0,0,1,5.66,13.66l-80,80a8,8,0,0,1-11.32,0Zm25,2.34L128,124.69,188.69,64Z"/>`,
  // arrow-u-up-left
  return: `<path d="M80,40v96L32,88Z" opacity="0.2"/><path d="M168,80H88V40a8,8,0,0,0-13.66-5.66l-48,48a8,8,0,0,0,0,11.32l48,48A8,8,0,0,0,88,136V96h80a48,48,0,0,1,0,96H80a8,8,0,0,0,0,16h88a64,64,0,0,0,0-128ZM72,116.69,43.31,88,72,59.31Z"/>`,
  // waves
  ph_current: `<path d="M216,70.39v112c-72,59.69-104-56.47-176,3.22v-112C112,13.92,144,130.08,216,70.39Z" opacity="0.2"/><path d="M222.16,177.25a8,8,0,0,1-1,11.25c-17.36,14.39-32.86,19.5-47,19.5-18.58,0-34.82-8.82-49.93-17-25.35-13.76-47.24-25.64-79.07.74a8,8,0,1,1-10.22-12.31c40.17-33.28,70.32-16.92,96.93-2.48,25.35,13.75,47.24,25.63,79.07-.74A8,8,0,0,1,222.16,177.25Zm-11.27-57c-31.83,26.38-53.72,14.5-79.07.74-26.61-14.43-56.76-30.79-96.93,2.49a8,8,0,0,0,10.22,12.31c31.83-26.38,53.72-14.5,79.07-.74,15.11,8.19,31.35,17,49.93,17,14.14,0,29.64-5.11,47-19.5a8,8,0,1,0-10.22-12.31ZM45.11,79.8c31.83-26.37,53.72-14.49,79.07-.74,15.11,8.2,31.35,17,49.93,17,14.14,0,29.64-5.12,47-19.5a8,8,0,1,0-10.22-12.31c-31.83,26.38-53.72,14.5-79.07.74C105.21,50.58,75.06,34.22,34.89,67.5A8,8,0,1,0,45.11,79.8Z"/>`,
  // drop-half
  ph_murky: `<path d="M208,144a80,80,0,0,1-80,80V16S208,72,208,144Z" opacity="0.2"/><path d="M174,47.75a254.19,254.19,0,0,0-41.45-38.3,8,8,0,0,0-9.18,0A254.19,254.19,0,0,0,82,47.75C54.51,79.32,40,112.6,40,144a88,88,0,0,0,176,0C216,112.6,201.49,79.32,174,47.75ZM56,144c0-50,42.26-92.71,64-111.4V215.54A72.08,72.08,0,0,1,56,144Zm80,71.54V32.6C157.74,51.29,200,94,200,144A72.08,72.08,0,0,1,136,215.54Z"/>`,
  // cloud-rain
  ph_rain: `<path d="M224,92a68,68,0,0,1-68,68H76A44,44,0,1,1,90.2,74.34v.11A68.06,68.06,0,0,1,224,92Z" opacity="0.2"/><path d="M158.66,196.44l-32,48a8,8,0,1,1-13.32-8.88l32-48a8,8,0,0,1,13.32,8.88ZM232,92a76.08,76.08,0,0,1-76,76H132.28l-29.62,44.44a8,8,0,1,1-13.32-8.88L113.05,168H76A52,52,0,0,1,76,64a53.26,53.26,0,0,1,8.92.76A76.08,76.08,0,0,1,232,92Zm-16,0A60.06,60.06,0,0,0,96,88.46a8,8,0,0,1-16-.92q.21-3.66.77-7.23A38.11,38.11,0,0,0,76,80a36,36,0,0,0,0,72h80A60.07,60.07,0,0,0,216,92Z"/>`,
  // check-circle
  ph_none: `<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>`,
  // arrow-left
  arrow_left: `<path d="M112,56V200L40,128Z" opacity="0.2"/><path d="M216,120H120V56a8,8,0,0,0-13.66-5.66l-72,72a8,8,0,0,0,0,11.32l72,72A8,8,0,0,0,120,200V136h96a8,8,0,0,0,0-16ZM104,180.69,51.31,128,104,75.31Z"/>`,
  // arrow-right
  arrow_right: `<path d="M216,128l-72,72V56Z" opacity="0.2"/><path d="M221.66,122.34l-72-72A8,8,0,0,0,136,56v64H40a8,8,0,0,0,0,16h96v64a8,8,0,0,0,13.66,5.66l72-72A8,8,0,0,0,221.66,122.34ZM152,180.69V75.31L204.69,128Z"/>`,
}

const OWN: Partial<Record<IconKind, string>> = {
  cascada: `<path d="M88 64 H168 V172 H88 Z" opacity="0.2"/><ellipse cx="128" cy="200" rx="88" ry="24" opacity="0.2"/><path d="M48 64 H208" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M92 64 C88 104 98 140 92 172" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M128 64 C124 104 134 140 128 172" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M164 64 C160 104 170 140 164 172" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 200 Q84 180 128 200 T216 200" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  glacier: `<path d="M78 118 L104 72 L130 118 L117 108 L104 122 L91 108 Z" opacity="0.2"/><path d="M24 208 L104 72 L144 140 L176 96 L232 208 Z" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M78 118 L91 108 L104 122 L117 108 L130 118" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  sunrise: `<path d="M64 184 A64 64 0 0 1 192 184 Z" opacity="0.2"/><path d="M24 184 H232" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M64 184 A64 64 0 0 1 192 184" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M128 32 V88 M100 60 L128 32 L156 60" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 136 L56 148 M216 136 L200 148" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M80 216 H176" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  sunset: `<path d="M64 184 A64 64 0 0 1 192 184 Z" opacity="0.2"/><path d="M24 184 H232" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M64 184 A64 64 0 0 1 192 184" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M128 32 V88 M100 60 L128 88 L156 60" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 136 L56 148 M216 136 L200 148" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M80 216 H176" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  cable: `<rect x="24" y="48" width="48" height="64" rx="10" opacity="0.2"/><rect x="184" y="48" width="48" height="64" rx="10" opacity="0.2"/><rect x="24" y="48" width="48" height="64" rx="10" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><rect x="184" y="48" width="48" height="64" rx="10" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M48 112 C96 180 160 180 208 112" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M112 164 A16 24 0 1 0 144 164" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  canyon: `<path d="M24 32 C60 100 52 164 92 224 H24 Z" opacity="0.2"/><path d="M232 32 C196 100 204 164 164 224 H232 Z" opacity="0.2"/><path d="M24 32 C60 100 52 164 92 224" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M232 32 C196 100 204 164 164 224" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M104 200 Q128 188 152 200" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  rappel: `<path d="M40 24 H72 V232 H40 Z" opacity="0.2"/><path d="M72 24 V232" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><circle cx="136" cy="48" r="20" opacity="0.2"/><circle cx="136" cy="48" r="20" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M136 68 V196" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M108 168 L136 196 L164 168" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  ph_backwash: `<circle cx="136" cy="164" r="56" opacity="0.2"/><path d="M24 56 H88" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M88 56 C92 92 96 108 108 118" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M80 164 A56 56 0 1 1 136 220" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M158 202 L136 220 L158 238" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  ph_siphon: `<path d="M32 88 H224 V224 H32 Z" opacity="0.2"/><path d="M32 88 Q64 72 96 88 T160 88 T224 88" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M128 112 C176 120 176 168 128 168 C96 168 100 136 128 136" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M128 168 V216" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M104 192 L128 216 L152 192" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  poza: `<path d="M64 112 H192 C184 200 72 200 64 112 Z" opacity="0.2"/><path d="M24 96 H56 C64 212 192 212 200 96 H232" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M72 120 Q100 104 128 120 T184 120" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  slide: `<path d="M40 56 C96 56 108 152 168 184 H216 V216 H40 Z" opacity="0.2"/><path d="M40 56 C96 56 108 152 168 184 H216" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M196 164 L216 184 L196 204" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><circle cx="64" cy="40" r="16" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  downclimb: `<path d="M24 56 H96 V112 H152 V168 H232 V224 H24 Z" opacity="0.2"/><path d="M24 56 H96 V112 H152 V168 H232" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M64 120 V200 M40 176 L64 200 L88 176" fill="none" stroke="${AMBER}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
}

/** Scales the 256-unit artwork into the 100-unit box the cards place icons in. */
const GRID_SCALE = 100 / 256

/** Icon artwork in a 100×100 box, coloured amber. Unknown kinds fall back to `info`. */
export function iconPath(kind: IconKind): string {
  const art = PHOSPHOR[kind] ?? OWN[kind] ?? PHOSPHOR.info
  return `<g transform="scale(${GRID_SCALE})" fill="${AMBER}">${art}</g>`
}
