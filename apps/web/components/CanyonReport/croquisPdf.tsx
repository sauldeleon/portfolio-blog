import { G, Link, Path, Rect, Svg, Text, View } from '@react-pdf/renderer'

import {
  CROQUIS_HEADER_H,
  SEV_COLORS,
  STRINGS,
  layoutCroquis,
} from '@web/lib/cards'
import type { CroquisNode, CroquisObstacle, Lang } from '@web/lib/cards'

/** Croquis palette (mirrors lib/cards/theme.ts; inlined so the PDF renderer is self-contained). */
const C = {
  panelBg: '#0E1820',
  panelStroke: '#2C414F',
  bone: '#F4F0E6',
  cold: '#94A8B3',
  amber: '#F4B83C',
  water: '#57BBCE',
  waterDeep: '#2C7E90',
  slab: '#405b6c',
}

interface CroquisPdfProps {
  obstacles: CroquisObstacle[]
  lang: Lang
  title?: string
  /** Maximum width of the croquis in the PDF (points). */
  width: number
  /**
   * Maximum height (points). When set, the croquis is scaled down to fit both
   * width and height so it never overflows onto a blank page.
   */
  maxHeight?: number
  /** Obstacle indices that have their own waypoint section to link to. */
  linkable: Set<number>
}

function nodeGlyph(node: CroquisNode) {
  const { x, yTop, yBot, endX } = node
  const type = node.obstacle.type
  const parts: React.ReactNode[] = []

  if (type === 'salto' || type === 'salto-rapel') {
    const midx = (x + endX) / 2
    // Leap arc + landing pool (ellipse emulated with an arc path).
    parts.push(
      <Path
        key="arc"
        d={`M${x} ${yTop} Q ${midx} ${yTop - 28} ${endX} ${yBot - 6}`}
        stroke={C.bone}
        strokeWidth={2.2}
        strokeDasharray="7 6"
        fill="none"
      />,
      <Path
        key="pool"
        d={`M${endX - 30} ${yBot + 6} a30 11 0 1 0 60 0 a30 11 0 1 0 -60 0`}
        fill={C.waterDeep}
        stroke={C.water}
        strokeWidth={1.5}
      />,
    )
  }
  if (type === 'tobogan') {
    const c1x = x + (endX - x) * 0.15
    const c2x = x + (endX - x) * 0.6
    parts.push(
      <Path
        key="chute"
        d={`M${x} ${yTop} C ${c1x} ${yTop} ${c2x} ${yBot} ${endX} ${yBot}`}
        stroke={C.water}
        strokeWidth={3}
        fill="none"
      />,
    )
  }
  if (type === 'rapel' || type === 'salto-rapel') {
    // Rock slab + dashed rope + anchor bolt.
    parts.push(
      <Path
        key="slab"
        d={`M${x} ${yTop} L${x - 24} ${yTop} L${x - 30} ${yBot} L${x} ${yBot} Z`}
        fill={C.panelStroke}
        stroke={C.slab}
        strokeWidth={1}
      />,
      <Path
        key="rope"
        d={`M${x} ${yTop} L${x} ${yBot}`}
        stroke={C.amber}
        strokeWidth={2.4}
        strokeDasharray="1 6"
      />,
      <Path
        key="anchor"
        d={`M${x - 7} ${yTop - 2} L${x} ${yTop - 11} L${x + 7} ${yTop - 2}`}
        stroke={C.amber}
        strokeWidth={2.4}
        fill="none"
      />,
    )
  }
  return <G>{parts}</G>
}

/** Localised category label for a node (mirrors croquisCard's nodeLabel). */
function nodeLabel(node: CroquisNode, lang: Lang): string {
  const cats = STRINGS[lang].categories
  const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase()
  if (node.obstacle.type === 'salto-rapel')
    return `${cap(cats.salto)} / ${cap(cats.rappel)}`
  if (node.obstacle.type === 'rapel') return cap(cats.rappel)
  if (node.obstacle.type === 'tobogan') return cap(cats.tobogan)
  return cap(cats.salto)
}

function metaLabel(node: CroquisNode, lang: Lang): string {
  const s = STRINGS[lang]
  const parts: string[] = []
  if (node.obstacle.meters != null) parts.push(`${node.obstacle.meters} m`)
  if (node.obstacle.side === 'left') parts.push(`< ${s.side_left}`)
  else if (node.obstacle.side === 'right') parts.push(`${s.side_right} >`)
  return parts.join('   ')
}

/**
 * The croquis drawn as crisp vector graphics for the PDF report, with a
 * transparent Link over each waypoint that has images (tap → jumps to its
 * section). Reuses layoutCroquis so it matches the on-screen schematic.
 */
export function CroquisPdf({
  obstacles,
  lang,
  title,
  width,
  maxHeight,
  linkable,
}: CroquisPdfProps) {
  const layout = layoutCroquis(obstacles)
  const headerH = title?.trim() ? CROQUIS_HEADER_H : 0
  const W = layout.width
  const H = layout.height + headerH
  // Fit to both width and (when given) height so a tall serpentine croquis
  // shrinks to a single page instead of overflowing onto a blank one.
  const scale = maxHeight ? Math.min(width / W, maxHeight / H) : width / W
  const renderW = W * scale
  const renderH = H * scale
  const s = STRINGS[lang]

  return (
    <View style={{ position: 'relative', width: renderW, height: renderH }}>
      <Svg width={renderW} height={renderH} viewBox={`0 0 ${W} ${H}`}>
        <Rect
          x={8}
          y={8}
          width={W - 16}
          height={H - 16}
          rx={28}
          fill={C.panelBg}
          stroke={C.panelStroke}
          strokeWidth={1.6}
        />
        {headerH > 0 && (
          <>
            <Rect x={8} y={80} width={6} height={80} rx={3} fill={C.amber} />
            <Text x={40} y={44} fill={C.amber} fontSize={16}>
              CROQUIS
            </Text>
            <Text x={40} y={72} fill={C.bone} fontSize={26}>
              {title}
            </Text>
          </>
        )}
        <G transform={`translate(0 ${headerH})`}>
          {layout.segments.map((seg, i) => {
            const mx = (seg.x1 + seg.x2) / 2
            return (
              <Path
                key={i}
                d={`M${seg.x1} ${seg.y1} C ${mx} ${seg.y1} ${mx} ${seg.y2} ${seg.x2} ${seg.y2}`}
                stroke={C.water}
                strokeWidth={3}
                fill="none"
                strokeDasharray={seg.kind === 'return' ? '2 7' : undefined}
              />
            )
          })}
          {layout.nodes.map((node) => (
            <G key={node.index}>
              {nodeGlyph(node)}
              <Path
                d={`M${node.x} ${node.yTop - 28} a5 5 0 1 0 0.1 0 Z`}
                fill={SEV_COLORS[node.obstacle.severity]}
              />
              <Text
                x={node.x + 11}
                y={node.yTop - 23}
                fill={C.bone}
                fontSize={13}
              >
                {nodeLabel(node, lang)}
              </Text>
              {metaLabel(node, lang) && (
                <Text
                  x={(node.x + node.endX) / 2}
                  y={node.yBot + 28}
                  fill={C.cold}
                  fontSize={11}
                  textAnchor="middle"
                >
                  {metaLabel(node, lang)}
                </Text>
              )}
            </G>
          ))}
          {layout.nodes.length > 0 && (
            <>
              <Text
                x={layout.access.x - 64}
                y={layout.access.y - 24}
                fill={C.cold}
                fontSize={11}
              >
                {s.croquis_access}
              </Text>
              <Text
                x={layout.exit.x + 6}
                y={layout.exit.y + 4}
                fill={C.cold}
                fontSize={11}
              >
                {s.croquis_exit}
              </Text>
            </>
          )}
        </G>
      </Svg>
      {layout.nodes
        .filter((node) => linkable.has(node.index))
        .map((node) => (
          <Link
            key={node.index}
            src={`#wp-${node.index}`}
            style={{
              position: 'absolute',
              left: node.box.x * scale,
              top: (node.box.y + headerH) * scale,
              width: node.box.w * scale,
              height: node.box.h * scale,
            }}
          >
            {/* Fills the link so it always has a measured, clickable box. */}
            <View style={{ width: '100%', height: '100%' }} />
          </Link>
        ))}
    </View>
  )
}
