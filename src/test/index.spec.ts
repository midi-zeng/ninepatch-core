import { NinePatchCore } from '../index'

const orgin = require('./images/orgin.png')

test('getChunkData', async () => {
  try {
    const npp = new NinePatchCore(orgin)
    const res = await npp.getChunkData()
    expect(res?.padding?.bottom !== undefined).toEqual(true)
  } catch (error) {
    expect(Error).toEqual(Error)
  }
})

test('wasNotSerialized', async () => {
  try {
    const npp = new NinePatchCore(orgin)
    const res = await npp.wasNotSerialized()
    expect(res?.status).toEqual(true)
  } catch (error) {
    expect(Error).toEqual(Error)
  }
})
