import * as type from '../interfaces'
import { rgba2hex } from '../utils'

export function getImageProperty(buffer: ArrayBuffer): type.ImageProperty {
  const chunkLengthBytes = 4 // chunk length in bytes
  const typeBytes = 4 // 4 bytes chunk type
  const CRCBYTES = 4 // 4 byte CRC

  const view = new DataView(buffer)
  const first4Byte = view.getUint32(0)
  const signatureHex = Number(first4Byte).toString(16) // image signature hex

  const chunkDataLegth = view.getUint32(8) // chunk data length
  const IDHRChunkBuffer = buffer.slice(
    8,
    8 + chunkLengthBytes + typeBytes + chunkDataLegth + CRCBYTES
  )

  const dv = new DataView(IDHRChunkBuffer)
  const Width = dv.getUint32(4 + 4)
  const Height = dv.getUint32(4 + 4 + 4)

  return {
    Width,
    Height,
    Hex: signatureHex
  }
}

export async function getImagePixels(
  file: File,
  width: number,
  height: number
): Promise<Uint8ClampedArray> {
  return new Promise(resolve => {
    const urlCreator = window.URL || window.webkitURL
    const url = urlCreator.createObjectURL(file)

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, width, height).data
      resolve(data)
    }

    img.src = url
  })
}

export function wasNotSerializedNinePatch(
  data: Uint8ClampedArray,
  width: number,
  height: number
): type.CheckColorRes {
  const lineWidth = width * 4
  const sidesData = new Array(height).fill(0).reduce(
    (acc: type.PixelsSideData, _, index) => {
      const start = index * lineWidth
      const line = data.slice(start, start + lineWidth)

      // left side
      acc.left.push(...line.slice(0, 4))

      // right side
      acc.right.push(...line.slice(lineWidth - 4, lineWidth))

      // top side
      if (index === 0) {
        acc.top.push(...line)
      }

      // bottom side
      if (index === height - 1) {
        acc.bottom.push(...line)
      }

      return acc
    },
    {
      left: [],
      right: [],
      top: [],
      bottom: []
    }
  )

  return Object.keys(sidesData).reduce(
    (acc: any, k) => {
      const sideData = (sidesData as any)?.[k] ?? []
      const sidePixelsData = getNinePatchSidePixelsData(sideData, type.PixelsSideLabel[k])

      if (!sidePixelsData?.status) {
        acc.status = false
        acc?.msg?.push(...(sidePixelsData?.msg ?? []))
      }

      return acc
    },
    {
      status: true,
      msg: []
    }
  )
}

export function getNinePatchSidePixelsData(side: number[], label: string): type.CheckColorRes {
  const width = Math.ceil(side?.length / 4) // 4 bytes per pixel
  let blackSideWidth = 0 // 黑边宽度，必须>0

  const result: type.CheckColorRes = new Array(width).fill(0).reduce(
    (acc: type.CheckColorRes, _, index) => {
      const start = index * 4
      const end = start + 4
      const color = side.slice(start, end)?.join(',')
      const currentPixel = index + 1

      // 头尾必须是透明颜色
      if (currentPixel === 1 && color !== type.Color.Transparent) {
        acc.status = false
        acc.msg?.push(`【${label}】第1个像素必须是透明的，当前颜色: ${rgba2hex(color)}`)
      }

      // 最后一个像素节点
      if (currentPixel === width && color !== type.Color.Transparent) {
        acc.status = false
        acc.msg?.push(`【${label}】最后一个像素必须是透明的，当前颜色: ${rgba2hex(color)}`)
      }

      // 中间的颜色需要透明或黑色
      if (currentPixel > 1 && currentPixel < width) {
        if (color !== type.Color.Transparent && color !== type.Color.Black) {
          acc.status = false
          acc.msg?.push(
            `【${label}】第${currentPixel}个像素颜色错误（必须黑色或透明），当前颜色: ${rgba2hex(
              color
            )}`
          )
        }

        if (color === type.Color.Black) {
          blackSideWidth++
        }
      }

      return acc
    },
    {
      status: true,
      msg: []
    }
  )

  if (blackSideWidth === 0) {
    result.status = false
    result.msg?.push(`【${label}】no black side`)
  }

  return result
}

export function rgba2Color(r: number, g: number, b: number, a: number): number {
  return (r << 24) | (g << 16) | (b << 8) | a
}

/**
 * 获取分区数据
 * @param data 像素点
 * @param cornerColor 透明/黑色
 */
export function getSegment(data: number[], cornerColor: type.SegmentColorType): type.Segment[] {
  const segment: type.Segment[] = []
  let curColor = rgba2Color(data[0], data[1], data[2], data[3])
  let preType: number =
    curColor === cornerColor ? type.SegmentColorType.Transparent : type.SegmentColorType.Black
  let start = 1
  let curPos = 1
  let width: number, curType: number

  for (let i = 4; i < data.length; i += 4) {
    curPos = i / 4 + 1
    curColor = rgba2Color(data[i], data[i + 1], data[i + 2], data[i + 3])
    curType =
      curColor === cornerColor ? type.SegmentColorType.Transparent : type.SegmentColorType.Black
    if (preType !== curType) {
      width = curPos - start
      segment.push({ width, start, type: preType })
      preType = curType
      start = curPos
    }
  }

  width = curPos - start + 1
  segment.push({ width, start, type: preType })
  return segment
}

export function getBlackLineData(segment: type.Segment[]): type.NpTcChunkDiv {
  const item = segment?.find(item => {
    if (item?.type === type.SegmentColorType.Black) {
      return item
    }
  })

  const start = item?.start ?? 0
  const stop = start + (item?.width ?? 0)

  // 减去黑边的1像素
  return {
    start: start > 0 ? start - 1 : 0,
    stop: stop > 0 ? stop - 1 : 0
  }
}
