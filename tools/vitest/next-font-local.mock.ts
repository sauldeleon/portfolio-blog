// Test stand-in for next/font/local, which only works inside a Next build.
export default function localFont() {
  return {
    className: 'className',
    variable: 'variable',
    style: { fontFamily: 'fontFamily' },
  }
}
