import type { CroquisObstacle } from './croquisData'

/** A positioned obstacle within the croquis. */
export interface CroquisNode {
  obstacle: CroquisObstacle
  index: number
  /** Entry x (the obstacle's lip / take-off). */
  x: number
  /** Top (lip) and bottom (pool / landing) y of the gesture. */
  yTop: number
  yBot: number
  /** Downstream end of the gesture (pool for jumps/slides). */
  endX: number
  /** Where the river exits — the foot for a vertical rappel, else endX. */
  exitX: number
  /** Row index in serpentine mode, null in single-line mode. */
  row: number | null
  /** Hover / hit region around the gesture. */
  box: { x: number; y: number; w: number; h: number }
}

/** A stretch of river between two points. */
export interface CroquisSegment {
  kind: 'river' | 'return'
  x1: number
  y1: number
  x2: number
  y2: number
}

/** A fully laid-out croquis, ready to render either statically or live. */
export interface CroquisLayout {
  mode: 'single' | 'serpentine'
  nodes: CroquisNode[]
  segments: CroquisSegment[]
  access: { x: number; y: number }
  exit: { x: number; y: number }
  width: number
  height: number
}

/** Above this obstacle count the river serpentines into rows. */
export const SINGLE_MAX = 8
/** Default drawing width used for the PNG export and the fallback preview. */
export const CROQUIS_WIDTH = 1180

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

interface Raw {
  obstacle: CroquisObstacle
  index: number
  x: number
  yTop: number
  yBot: number
  row: number | null
}

/** Finish a raw placement into a node (endX / exitX / hit box). */
function toNode(raw: Raw, run: number): CroquisNode {
  const endX = raw.x + run
  // A pure rappel is a vertical drop at x, so the river exits from its foot;
  // jumps and slides (and combos) exit from their downstream pool at endX.
  const exitX = raw.obstacle.type === 'rapel' ? raw.x : endX
  return {
    obstacle: raw.obstacle,
    index: raw.index,
    x: raw.x,
    yTop: raw.yTop,
    yBot: raw.yBot,
    endX,
    exitX,
    row: raw.row,
    box: {
      x: raw.x - 40,
      y: raw.yTop - 44,
      w: endX - raw.x + 80,
      h: raw.yBot - raw.yTop + 92,
    },
  }
}

/** Connectors (access sweep, river between nodes, row returns, exit tail). */
function buildSegments(nodes: CroquisNode[]): {
  segments: CroquisSegment[]
  access: { x: number; y: number }
  exit: { x: number; y: number }
} {
  const first = nodes[0]
  const segments: CroquisSegment[] = [
    {
      kind: 'river',
      x1: first.x - 70,
      y1: first.yTop,
      x2: first.x,
      y2: first.yTop,
    },
  ]
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1]
    const node = nodes[i]
    const wrap = prev.row !== null && prev.row !== node.row
    segments.push({
      kind: wrap ? 'return' : 'river',
      x1: prev.exitX,
      y1: prev.yBot,
      x2: node.x,
      y2: node.yTop,
    })
  }
  const last = nodes[nodes.length - 1]
  const exit = { x: last.exitX + 96, y: last.yBot + 16 }
  segments.push({
    kind: 'river',
    x1: last.exitX,
    y1: last.yBot,
    x2: exit.x,
    y2: exit.y,
  })
  return { segments, access: { x: first.x, y: first.yTop }, exit }
}

/** Single flowing line: cumulative descent, normalised to a fixed band height. */
function layoutSingle(obstacles: CroquisObstacle[]): CroquisLayout {
  const STEP = 240
  const PAD = 120
  const TOP = 90
  const H = 460
  const run = STEP * 0.42
  const dropPx = (m: number) => clamp(46 + Math.sqrt(m) * 26, 46, 210)

  let y = TOP
  const raws: Raw[] = obstacles.map((obstacle, index) => {
    const x = PAD + index * STEP
    const drop = dropPx(obstacle.meters ?? 0)
    const yTop = y
    const yBot = y + drop
    y = yBot
    return { obstacle, index, x, yTop, yBot, row: null }
  })

  const maxY = Math.max(...raws.map((r) => r.yBot))
  const sc = maxY > H - 70 ? (H - 70 - TOP) / (maxY - TOP) : 1
  raws.forEach((r) => {
    r.yTop = TOP + (r.yTop - TOP) * sc
    r.yBot = TOP + (r.yBot - TOP) * sc
  })

  const nodes = raws.map((r) => toNode(r, run))
  const { segments, access, exit } = buildSegments(nodes)
  return {
    mode: 'single',
    nodes,
    segments,
    access,
    exit,
    width: PAD * 2 + (obstacles.length - 1) * STEP + 200,
    height: H,
  }
}

/** Serpentine: rows fill the width L→R, the river keeps descending within each. */
function layoutSerpentine(
  obstacles: CroquisObstacle[],
  containerWidth: number,
): CroquisLayout {
  const STEP = 185
  const PAD = 80
  const TOP = 70
  const DESC = 18
  const ROW_GAP = 34
  const LABEL_H = 46
  const run = STEP * 0.4
  const targetW = Math.max(640, containerWidth)
  const perRow = Math.max(3, Math.floor((targetW - PAD * 2) / STEP))
  const dropPx = (m: number) => clamp(30 + Math.sqrt(m) * 13, 30, 92)
  const nRows = Math.ceil(obstacles.length / perRow)

  const nodes: CroquisNode[] = []
  let cursorY = TOP
  for (let r = 0; r < nRows; r++) {
    let y = cursorY + 20
    let rowBottom = y
    for (let c = 0; c < perRow; c++) {
      const index = r * perRow + c
      if (index >= obstacles.length) break
      const obstacle = obstacles[index]
      const x = PAD + c * STEP
      const drop = dropPx(obstacle.meters ?? 0)
      const yTop = y
      const yBot = y + drop
      nodes.push(toNode({ obstacle, index, x, yTop, yBot, row: r }, run))
      y = yBot + DESC
      rowBottom = yBot
    }
    cursorY = rowBottom + LABEL_H + ROW_GAP
  }

  const { segments, access, exit } = buildSegments(nodes)
  return {
    mode: 'serpentine',
    nodes,
    segments,
    access,
    exit,
    width: targetW,
    height: cursorY + 10,
  }
}

/**
 * Lay out obstacles into a croquis. Few obstacles flow along a single
 * descending line; many serpentine into rows that fill `containerWidth` and
 * grow downward. Returns geometry only — rendering (static SVG or the live
 * component) is layered on top.
 */
export function layoutCroquis(
  obstacles: CroquisObstacle[],
  containerWidth: number = CROQUIS_WIDTH,
): CroquisLayout {
  if (obstacles.length === 0) {
    return {
      mode: 'single',
      nodes: [],
      segments: [],
      access: { x: 0, y: 0 },
      exit: { x: 0, y: 0 },
      width: Math.max(640, containerWidth),
      height: 200,
    }
  }
  return obstacles.length <= SINGLE_MAX
    ? layoutSingle(obstacles)
    : layoutSerpentine(obstacles, containerWidth)
}
