import { parseJSON } from './utils'

describe('parseJSON', () => {
  it('should return undefined on null', () => {
    expect(parseJSON(null)).toBeUndefined()
  })
  it('should return correct parsed undefined', () => {
    expect(parseJSON('undefined')).toBeUndefined()
  })

  it('should return correct parsed object', () => {
    expect(parseJSON('{"key":"string"}')).toEqual({ key: 'string' })
  })

  it('should return correct parsed array', () => {
    expect(parseJSON('["string"]')).toEqual(['string'])
  })

  it('should return value if JSON.parse fails', () => {
    expect(parseJSON('value')).toEqual('value')
  })
})
