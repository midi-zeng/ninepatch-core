import * as util from '../utils'
import 'jest-canvas-mock'
import * as type from '../interfaces'

const orginSrc =
  'https://o-static.ihago.net/ikxd/8ee25c755010c886014ce2e92b04aee9/feichedianjiu.png'
const src =
  'https://o-static.ihago.net/ikxd/09b5414978d0228b71109a185648a730/compile.feichedianjiu.png'

test('rgba转hex', () => {
  const color = util.rgba2hex('51,51,51,255')
  expect(color).toEqual('#333333ff')
})

describe('file.ts', () => {
  test('isFile', () => {
    const file = new File([], '')
    const res = util.isFile(file)
    expect(res).toEqual(true)
  })

  test('getFileByUrl', async () => {
    const file = await util.getFileByUrl(src)
    expect(util.isFile(file)).toEqual(true)
  })

  test('getFileArrayBuffer', async () => {
    const buffer = await util.getFileArrayBuffer(new File([], ''))
    const isBuffer = Object.prototype.toString.call(buffer) === '[object ArrayBuffer]'
    expect(isBuffer).toEqual(true)
  })
})

describe('image.ts', () => {
  test('getImageProperty', async () => {
    try {
      const file = await util.getFileByUrl(orginSrc)
      const buffer = await util.getFileArrayBuffer(file)
      const res = util.getImageProperty(buffer)

      expect(res).toEqual({
        Width: 182,
        Height: 122,
        Hex: type.ImageHax.PNG
      })
    } catch (error) {
      console.log(error)
      expect(Error).toEqual(Error)
    }
  })

  test('getImagePixels', async () => {
    global.Image = class Image extends window.Image {
      width = 100
      height = 100
      onload: () => string

      constructor() {
        super()

        this.onload = () => ''

        setTimeout(() => {
          this.onload() // simulate success
        }, 1000)
      }
    }

    global.URL.createObjectURL = () => {
      return orginSrc
    }

    // Jest URL.createObjectURL is not a function
    // https://stackoverflow.com/questions/52968969/jest-url-createobjecturl-is-not-a-function

    const file = await util.getFileByUrl(orginSrc)
    const res = await util.getImagePixels(file, 182, 122)
    expect(res.length > 0).toEqual(true)
  })

  test('wasNotSerializedNinePatch', () => {
    const res = util.wasNotSerializedNinePatch(new Uint8ClampedArray(100), 182, 122)
    expect(res.status).toEqual(false)
  })

  test('getNinePatchSidePixelsData', () => {
    const res = util.getNinePatchSidePixelsData([], '')
    expect(res.status).toEqual(false)
  })

  test('getSegment', () => {
    const data = [0, 0, 0, 0]
    const res = util.getSegment(data, type.SegmentColorType.Black)
    expect(res).toEqual([{ start: 1, type: type.SegmentColorType.Black, width: 1 }])
  })

  test('getBlackLineData', () => {
    const segment = [
      { start: 0, width: 13, type: type.SegmentColorType.Transparent },
      { start: 14, width: 15, type: type.SegmentColorType.Black },
      { start: 30, width: 138, type: type.SegmentColorType.Transparent }
    ]
    const res = util.getBlackLineData(segment)
    expect(res).toEqual({ start: 13, stop: 28 })
  })
})
