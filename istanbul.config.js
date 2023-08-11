module.exports = {
  verbose: false,
  check: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    each: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  reporting: {
    reports: ['text', 'html'],
    dir: './coverage/report',
    watermarks: {
      statements: [99.999999999, 100],
      branches: [99.999999999, 100],
      functions: [99.999999999, 100],
      lines: [99.999999999, 100],
    },
  },
}
