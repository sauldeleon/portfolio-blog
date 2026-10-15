import { loginViaUi } from '../support/login'

const GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="e2e">
  <wpt lat="42.6050" lon="-0.1280"><ele>915</ele><name>Inicio</name><sym>Information</sym></wpt>
  <trk><name>E2E</name><trkseg>
    <trkpt lat="42.6040" lon="-0.1250"><ele>910</ele><time>2026-06-04T09:00:00Z</time></trkpt>
    <trkpt lat="42.6041" lon="-0.1251"><ele>911</ele><time>2026-06-04T09:00:05Z</time></trkpt>
    <trkpt lat="42.6042" lon="-0.1252"><ele>912</ele><time>2026-06-04T09:00:10Z</time></trkpt>
    <trkpt lat="42.6043" lon="-0.1253"><ele>913</ele><time>2026-06-04T09:00:15Z</time></trkpt>
    <trkpt lat="42.6050" lon="-0.1270"><ele>930</ele><time>2026-06-04T09:01:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`

const RAW = 'https://raw.githubusercontent.com/sauldeleon/gpx/main'

describe('Admin tracks — GPX editor', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
    // GitHub is stubbed: the editor must never write to the real repo here.
    cy.intercept('GET', /\/api\/tracks\/?$/, {
      files: [
        { path: 'e2e.gpx', size: 2048, rawUrl: `${RAW}/e2e.gpx` },
        { path: 'other.gpx', size: 1024, rawUrl: `${RAW}/other.gpx` },
      ],
    }).as('list')
    cy.intercept('GET', /\/api\/tracks\/file/, {
      path: 'e2e.gpx',
      rawUrl: `${RAW}/e2e.gpx`,
      content: GPX,
    }).as('file')
    cy.intercept('PUT', /\/api\/tracks\/file/, {
      path: 'e2e-clean.gpx',
      rawUrl: `${RAW}/e2e-clean.gpx`,
      commitSha: 'abc',
      created: true,
    }).as('save')
    cy.intercept('POST', /\/api\/tracks\/?$/, {
      statusCode: 201,
      body: {
        path: 'Ordesa.gpx',
        rawUrl: `${RAW}/Ordesa.gpx`,
        commitSha: 'def',
        created: true,
      },
    }).as('upload')
    loginViaUi()
    cy.url({ timeout: 20000 }).should('include', '/admin/posts')
    cy.get('[data-testid="admin-nav"]').should('be.visible')
  })

  it('cleans a track, adds a waypoint and saves the -clean copy', () => {
    cy.visit('/admin/tracks')
    cy.wait('@list')
    cy.get('[data-testid="track-row-e2e"]', { timeout: 15000 })
      .contains('a', 'Edit original')
      .click()

    cy.url().should('include', '/admin/tracks/edit')
    cy.wait('@file')
    cy.get('[data-testid="track-workspace"]', { timeout: 20000 }).should(
      'be.visible',
    )
    cy.get('[data-testid="save-target"]').should('contain', 'e2e-clean.gpx')
    cy.get('[data-testid="track-summary"]').should('contain', '5 points')

    cy.get('[data-testid="apply-clean"]').click()
    cy.get('[data-testid="track-summary"]').should('not.contain', '5 points')
    cy.get('[data-testid="undo"]').should('not.be.disabled')

    cy.get('[data-testid="tab-waypoints"]').click()
    cy.get('[data-testid="toggle-add-waypoint"]').click()
    cy.get('[data-testid="track-editor-map"] .leaflet-container').click(
      'center',
    )
    cy.get('[data-testid^="waypoint-wpt-"]').should('have.length', 2)

    cy.get('[data-testid="save"]').click()
    cy.wait('@save')
      .its('request.body')
      .should((body: { sourcePath: string; content: string }) => {
        expect(body.sourcePath).to.eq('e2e.gpx')
        expect(body.content).to.contain('<name>Waypoint 2</name>')
      })
    cy.get('[data-testid="save-result"]').should('contain', 'e2e-clean.gpx')
  })

  it('cleans only a section picked by km', () => {
    cy.visit('/admin/tracks/edit?path=e2e.gpx')
    cy.wait('@file')
    cy.get('[data-testid="track-workspace"]', { timeout: 20000 }).should(
      'be.visible',
    )
    cy.get('[data-testid="scope-section"]').should('be.disabled')
    cy.get('[data-testid="section-to"]').clear()
    cy.get('[data-testid="section-to"]').type('0.04{enter}')
    cy.get('[data-testid="scope-section"]')
      .should('have.attr', 'aria-pressed', 'true')
      .and('contain', '#1–#4')
    cy.get('[data-testid="preview-total"]').should('exist')
    cy.get('[data-testid="apply-clean"]').click()
    // Points #2 and #3 lie on the line from #1 to #4; the far end is untouched.
    cy.get('[data-testid="track-summary"]').should('contain', '3 points')
    cy.get('[data-testid="scope-section"]').should('contain', '#1–#2')
  })

  it('uploads a new track under a custom name', () => {
    cy.visit('/admin/tracks')
    cy.wait('@list')
    cy.get('[data-testid="tracks-upload"]', { timeout: 15000 }).click()
    cy.get('[data-testid="upload-input"]').selectFile(
      {
        contents: Cypress.Buffer.from(GPX),
        fileName: '2026-06-04 recording.gpx',
        mimeType: 'application/gpx+xml',
      },
      { force: true },
    )
    cy.get('[data-testid="upload-name"]').should(
      'have.value',
      '2026-06-04 recording',
    )
    cy.get('[data-testid="upload-name"]').clear()
    cy.get('[data-testid="upload-name"]').type('e2e')
    cy.get('[data-testid="upload-name-error"]').should('contain', 'e2e.gpx')
    cy.get('[data-testid="upload-name"]').clear()
    cy.get('[data-testid="upload-name"]').type('Ordesa')
    cy.get('[data-testid="upload-submit"]').click()
    cy.wait('@upload')
      .its('request.body')
      .should((body: { name: string; content: string }) => {
        expect(body.name).to.eq('Ordesa')
        expect(body.content).to.match(/<trk>\s*<name>Ordesa<\/name>/)
      })
    cy.get('[data-testid="upload-notice"]')
      .should('contain', 'Ordesa.gpx')
      .contains('a', 'Open in editor')
      .should('have.attr', 'href')
      // next/link adds the trailing slash (trailingSlash: true).
      .and('match', /^\/admin\/tracks\/edit\/?\?path=Ordesa\.gpx$/)
  })
})
