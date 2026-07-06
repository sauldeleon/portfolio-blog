import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import { STRINGS } from '@web/lib/cards'
import type { CanyoningCardData, CroquisObstacle, Lang } from '@web/lib/cards'
import { cloudinaryTransform } from '@web/lib/cloudinary/transformUrl'

import { CroquisPdf } from './croquisPdf'

export interface CanyonReportDocumentProps {
  title: string
  lang: Lang
  obstacles: CroquisObstacle[]
  summary: CanyoningCardData | null
}

const COLORS = {
  ink: '#111820',
  muted: '#5a6b76',
  green: '#0f7a6b',
  line: '#d7dee2',
  disclaimerBg: '#fdf3e0',
  disclaimerBorder: '#e2a640',
  page: '#ffffff',
}

const PAGE_PADDING = 32
const CONTENT_WIDTH = 595.28 - PAGE_PADDING * 2
// A4 height minus padding and the "Croquis" heading, so the croquis fits its
// page without spilling onto a blank one.
const CROQUIS_MAX_HEIGHT = 841.89 - PAGE_PADDING * 2 - 65

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.page,
    color: COLORS.ink,
    fontSize: 10,
    padding: PAGE_PADDING,
    lineHeight: 1.5,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    marginBottom: 2,
  },
  eyebrow: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.green,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: COLORS.green,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingBottom: 3,
    marginTop: 16,
    marginBottom: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryCell: {
    width: '33.33%',
    marginBottom: 8,
    paddingRight: 8,
  },
  summaryLabel: {
    fontSize: 7,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.muted,
  },
  summaryValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
  },
  disclaimer: {
    marginTop: 14,
    backgroundColor: COLORS.disclaimerBg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.disclaimerBorder,
    padding: 8,
    fontSize: 8.5,
    color: '#7a5a1e',
    lineHeight: 1.45,
  },
  wpTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    marginBottom: 2,
  },
  wpMeta: {
    fontSize: 9,
    color: COLORS.muted,
    marginBottom: 6,
  },
  note: {
    fontSize: 9.5,
    marginBottom: 2,
    paddingLeft: 8,
  },
  image: {
    width: '100%',
    maxHeight: 430,
    objectFit: 'contain',
    marginTop: 8,
  },
  backLink: {
    fontSize: 8,
    color: COLORS.green,
    textDecoration: 'none',
    marginBottom: 6,
  },
  croquisWrap: {
    alignItems: 'center',
  },
})

/** Present canyon-summary fields as label/value cells (skips empty fields). */
function summaryRows(
  summary: CanyoningCardData,
  s: (typeof STRINGS)[Lang],
): Array<{ label: string; value: string }> {
  const flow = summary.flowLevel
    ? ((s.flow_levels as Record<string, string>)[summary.flowLevel] ??
      summary.flowLevel)
    : undefined
  const candidates: Array<[string, string | undefined]> = [
    [s.difficulty, summary.grade],
    [s.desnivel, summary.desnivel],
    [s.max_rappel, summary.maxRappel],
    [s.rappels, summary.rappels],
    [s.approach, summary.approach],
    [s.in_canyon, summary.inCanyon],
    [s.return, summary.returnTime],
    [s.total, summary.total],
    [s.rope, summary.rope],
    [s.cars, summary.cars],
    [s.season, summary.season],
    [s.flow, flow],
  ]
  return candidates
    .filter(([, value]) => value != null && value !== '')
    .map(([label, value]) => ({ label, value: value as string }))
}

function severityLabel(
  severity: CroquisObstacle['severity'],
  s: (typeof STRINGS)[Lang],
): string {
  if (severity === 'danger') return s.sev_danger
  if (severity === 'caution') return s.sev_caution
  return s.sev_easy
}

function categoryLabel(
  type: CroquisObstacle['type'],
  s: (typeof STRINGS)[Lang],
): string {
  const cap = (v: string) => v.charAt(0) + v.slice(1).toLowerCase()
  if (type === 'salto-rapel')
    return `${cap(s.categories.salto)} / ${cap(s.categories.rappel)}`
  if (type === 'rapel') return cap(s.categories.rappel)
  if (type === 'tobogan') return cap(s.categories.tobogan)
  return cap(s.categories.salto)
}

function waypointMeta(ob: CroquisObstacle, s: (typeof STRINGS)[Lang]): string {
  const parts: string[] = [categoryLabel(ob.type, s)]
  if (ob.meters != null) parts.push(`${ob.meters} m`)
  if (ob.side === 'left') parts.push(s.side_left)
  else if (ob.side === 'right') parts.push(s.side_right)
  parts.push(severityLabel(ob.severity, s))
  return parts.join('  ·  ')
}

/**
 * The offline canyon report: an interactive croquis (tap a waypoint → its
 * images), that day's canyon-summary figures with a conditions disclaimer, and
 * one bookmarked, image-rich section per waypoint. Everything (incl. images) is
 * embedded so it works offline in the field.
 */
export function CanyonReportDocument({
  title,
  lang,
  obstacles,
  summary,
}: CanyonReportDocumentProps) {
  const s = STRINGS[lang]
  const heading = title.trim() || s.report_title
  const withPhotos = obstacles
    .map((ob, index) => ({ ob, index, photos: ob.photos ?? [] }))
    .filter(({ photos }) => photos.length > 0)
  const linkable = new Set(withPhotos.map(({ index }) => index))

  return (
    <Document title={heading}>
      {/* Page 1 — the outing's figures and the conditions disclaimer. */}
      <Page size="A4" style={styles.page} bookmark={s.report_title}>
        <Text style={styles.eyebrow}>{s.report_title}</Text>
        <Text style={styles.title}>{heading}</Text>

        {summary && (
          <View>
            <Text style={styles.sectionTitle}>{s.report_conditions}</Text>
            <View style={styles.summaryGrid}>
              {summaryRows(summary, s).map((row) => (
                <View key={row.label} style={styles.summaryCell}>
                  <Text style={styles.summaryLabel}>{row.label}</Text>
                  <Text style={styles.summaryValue}>{row.value}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.disclaimer}>{s.report_disclaimer}</Text>
          </View>
        )}
      </Page>

      {/* Page 2 — the croquis; tapping a waypoint jumps to its images. */}
      <Page size="A4" style={styles.page} bookmark={s.report_map}>
        <Text style={styles.sectionTitle}>{s.report_map}</Text>
        <View id="map" style={styles.croquisWrap}>
          <CroquisPdf
            obstacles={obstacles}
            lang={lang}
            title={heading}
            width={CONTENT_WIDTH}
            maxHeight={CROQUIS_MAX_HEIGHT}
            linkable={linkable}
          />
        </View>
      </Page>

      {/* One page per photographed waypoint: title then its images. */}
      {withPhotos.map(({ ob, index, photos }) => (
        <Page key={index} size="A4" style={styles.page} bookmark={ob.title}>
          <View id={`wp-${index}`}>
            <Link src="#map" style={styles.backLink}>
              {s.report_back}
            </Link>
            <Text style={styles.wpTitle}>{ob.title}</Text>
            <Text style={styles.wpMeta}>{waypointMeta(ob, s)}</Text>
            {ob.notes.map((note, i) => (
              <Text key={i} style={styles.note}>
                • {note.text}
              </Text>
            ))}
          </View>
          {photos.map((photo, i) => (
            <Image
              key={i}
              src={cloudinaryTransform(photo, 'f_auto,q_auto,w_1000')}
              style={styles.image}
            />
          ))}
        </Page>
      ))}
    </Document>
  )
}
