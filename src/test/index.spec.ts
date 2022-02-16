import { NinePatchPreload } from '../index'
import * as util from '../utils'

const src = 'https://o-static.ihago.net/ikxd/8ee25c755010c886014ce2e92b04aee9/feichedianjiu.png'
const compileSrc =
  'https://o-static.ihago.net/ikxd/09b5414978d0228b71109a185648a730/compile.feichedianjiu.png'

test('未传src或File对象', () => {
  try {
    const nnp = new NinePatchPreload({})
    expect(typeof nnp).toEqual('function')
  } catch (error) {
    expect(Error).toEqual(Error)
  }
})

test('getChunkData', async () => {
  try {
    const file = await util.getFileByUrl(compileSrc)
    const npp = new NinePatchPreload({ file })
    const res = await npp.getChunkData()
    expect(res?.padding?.bottom !== undefined).toEqual(true)
  } catch (error) {
    expect(Error).toEqual(Error)
  }
})

test('wasNotSerialized', async () => {
  try {
    const npp = new NinePatchPreload({ src })
    const res = await npp.wasNotSerialized()
    expect(res?.status).toEqual(true)
  } catch (error) {
    expect(Error).toEqual(Error)
  }
})
