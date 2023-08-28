import { publicUrl } from './generateUrl'

describe('publicUrl', () => {
  it('should generate the public url', () => {
    expect(publicUrl('/')).toEqual('https://test.url/')
    expect(publicUrl('/contact')).toEqual('https://test.url/contact')
  })
})
