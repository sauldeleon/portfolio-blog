import { getClientIp } from './getClientIp'

function makeRequest(headers: Record<string, string>) {
  return new Request('http://localhost', { headers })
}

describe('getClientIp', () => {
  it('uses the first x-forwarded-for entry', () => {
    expect(
      getClientIp(makeRequest({ 'x-forwarded-for': ' 1.1.1.1 , 2.2.2.2' })),
    ).toBe('1.1.1.1')
  })

  it('falls back to x-real-ip', () => {
    expect(getClientIp(makeRequest({ 'x-real-ip': '3.3.3.3' }))).toBe('3.3.3.3')
  })

  it('falls back to anonymous', () => {
    expect(getClientIp(makeRequest({}))).toBe('anonymous')
  })
})
