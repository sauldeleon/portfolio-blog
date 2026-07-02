import type { CroquisObstacle, CroquisType } from './croquisData'
import { CROQUIS_WIDTH, SINGLE_MAX, layoutCroquis } from './croquisLayout'

function ob(type: CroquisType, meters: number | null = 5): CroquisObstacle {
  return {
    type,
    title: `${type} ${meters}`,
    meters,
    side: null,
    severity: 'easy',
    notes: [],
  }
}

function many(n: number, type: CroquisType = 'salto'): CroquisObstacle[] {
  return Array.from({ length: n }, () => ob(type))
}

describe('layoutCroquis', () => {
  it('returns an empty single layout for no obstacles', () => {
    const l = layoutCroquis([])
    expect(l.mode).toBe('single')
    expect(l.nodes).toHaveLength(0)
    expect(l.segments).toHaveLength(0)
    expect(l.height).toBe(200)
    expect(l.width).toBe(CROQUIS_WIDTH)
  })

  describe('single mode', () => {
    it('stays single up to the threshold', () => {
      const l = layoutCroquis(many(SINGLE_MAX))
      expect(l.mode).toBe('single')
      expect(l.nodes).toHaveLength(SINGLE_MAX)
      expect(l.nodes.every((n) => n.row === null)).toBe(true)
    })

    it('connects with rivers only (no row returns)', () => {
      const l = layoutCroquis(many(3))
      expect(l.segments.every((s) => s.kind === 'river')).toBe(true)
      // access sweep + 2 inter-node + exit tail
      expect(l.segments).toHaveLength(4)
    })

    it('exits a rappel from its foot and a jump from its pool', () => {
      const l = layoutCroquis([ob('rapel'), ob('salto')])
      expect(l.nodes[0].exitX).toBe(l.nodes[0].x)
      expect(l.nodes[1].exitX).toBe(l.nodes[1].endX)
    })

    it('normalises tall descents to fit the band', () => {
      const l = layoutCroquis(
        many(SINGLE_MAX, 'rapel').map(() => ob('rapel', 200)),
      )
      const maxY = Math.max(...l.nodes.map((n) => n.yBot))
      expect(maxY).toBeLessThanOrEqual(391)
    })

    it('does not scale up a short descent', () => {
      const l = layoutCroquis([ob('salto', 1), ob('salto', 1)])
      // first node keeps the raw TOP baseline (no upscaling)
      expect(l.nodes[0].yTop).toBeCloseTo(90)
    })

    it('treats null metres as the minimum drop', () => {
      const l = layoutCroquis([ob('salto', null)])
      expect(l.nodes[0].yBot - l.nodes[0].yTop).toBeCloseTo(46)
    })

    it('produces a hit box around each gesture', () => {
      const [n] = layoutCroquis([ob('salto', 5)]).nodes
      expect(n.box.w).toBe(n.endX - n.x + 80)
      expect(n.box.x).toBe(n.x - 40)
    })
  })

  describe('serpentine mode', () => {
    it('switches above the threshold', () => {
      const l = layoutCroquis(many(SINGLE_MAX + 1))
      expect(l.mode).toBe('serpentine')
    })

    it('fills the container width and assigns rows', () => {
      const l = layoutCroquis(many(9), 1180)
      expect(l.width).toBe(1180)
      // perRow = floor((1180-160)/185) = 5 → index 5 starts row 1
      expect(l.nodes[4].row).toBe(0)
      expect(l.nodes[5].row).toBe(1)
    })

    it('drops to the next row with a return sweep', () => {
      const l = layoutCroquis(many(9), 1180)
      expect(l.segments.some((s) => s.kind === 'return')).toBe(true)
    })

    it('keeps at least three obstacles per row on a narrow width', () => {
      const l = layoutCroquis(many(9), 100)
      expect(l.width).toBe(640)
      // perRow clamped to 3 → index 3 starts row 1
      expect(l.nodes[3].row).toBe(1)
    })

    it('treats null metres as the minimum drop in a row', () => {
      const obstacles = many(9)
      obstacles[0] = ob('salto', null)
      const l = layoutCroquis(obstacles, 1180)
      expect(l.nodes[0].yBot - l.nodes[0].yTop).toBeCloseTo(30)
    })

    it('assigns rows across a long descent', () => {
      const l = layoutCroquis(many(12, 'rapel'), 1180)
      expect(l.nodes[0].row).toBe(0)
      expect(l.nodes[11].row).toBe(Math.floor(11 / 5))
    })
  })
})
