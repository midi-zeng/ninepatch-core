import extract from 'png-chunks-extract'
import { NpTcChunkPosition } from './config'
import * as type from './interfaces'
import * as util from './utils'

export default class NinePatchCore {
  private readonly src: string = ''
  private canvasCtx: CanvasRenderingContext2D | null = null
  private file: File = new File([], '')
  private buffer: ArrayBuffer = new ArrayBuffer(0)

  chunkData: type.NpTcChunkType = {
    padding: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    xDivs: {
      start: 0,
      stop: 0
    },
    yDivs: {
      start: 0,
      stop: 0
    },
    width: 0,
    height: 0
  }

  constructor(options: type.NinePatchPreloadReq) {
    if (!options?.src && !options?.file) {
      throw new Error('Parameter is invalid.')
    }

    if (options?.src) {
      this.src = options.src
    }

    if (options?.file) {
      this.file = options.file
    }
  }

  async getFile(): Promise<File> {
    if (this.file.size === 0) {
      this.file = await util.getFileByUrl(this.src)
    }

    return this.file
  }

  async getBuffer(): Promise<ArrayBuffer> {
    if (this.buffer.byteLength === 0) {
      const file = await this.getFile()
      this.buffer = await util.getFileArrayBuffer(file)
    }

    return this.buffer
  }

  async getCanvasCtx(): Promise<CanvasRenderingContext2D> {
    if (this.canvasCtx !== null) {
      return this.canvasCtx
    }

    this.canvasCtx = await new Promise(resolve => {
      const image = new Image()
      image.crossOrigin = 'Anonymous'

      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const context = canvas.getContext('2d') as CanvasRenderingContext2D
        context.drawImage(image, 0, 0)
        resolve(context)
      }

      image.src = this.src
    })

    return this.canvasCtx as CanvasRenderingContext2D
  }

  async getImageType(): Promise<type.NinePatchImageType> {
    const wasSerialized = await this.wasSerialized()

    if (wasSerialized) {
      return type.NinePatchImageType.Serialized
    }

    const res = await this.wasNotSerialized()
    if (res?.status) {
      return type.NinePatchImageType.Noterialized
    }

    return type.NinePatchImageType.None
  }

  /**
   * 判断npTc长度，>0表示是被序列化之后的点九图(安卓把编译的过程叫序列化)
   * @returns Boolean
   */
  async wasSerialized(): Promise<boolean> {
    const buffer = await this.getBuffer()
    const chunks = extract(new Uint8Array(buffer))
    const npTc = chunks.find((chunk: any) => chunk.name === type.NinePatchChunkName.Name)

    return npTc?.data?.length > 0
  }

  /**
   * 检查是不是未经序列化的点九图原图，不是的话返回异常像素点
   * @returns object
   */
  async wasNotSerialized(): Promise<type.CheckColorRes> {
    const buffer = await this.getBuffer()
    const file = await this.getFile()
    const property = util.getImageProperty(buffer)

    if (property.Hex === type.ImageHax.PNG) {
      const data = await util.getImagePixels(file, property.Width, property.Height)
      const res = util.wasNotSerializedNinePatch(data, property.Width, property.Height)

      return res
    }

    return {
      status: false,
      msg: []
    }
  }

  /**
   * 获取序列化点九图chunk
   * @returns type.NpTcChunkType
   */
  async getChunkData(): Promise<type.NpTcChunkType> {
    const buffer = await this.getBuffer()
    const imageType: type.NinePatchImageType = await this.getImageType()
    const property = util.getImageProperty(buffer)

    if (imageType === type.NinePatchImageType.Serialized) {
      await this.getSerializedChunkData()
    }

    if (imageType === type.NinePatchImageType.Noterialized) {
      await this.getNotSerializedChunkData(property.Width, property.Height)
      this.chunkData.clipPath = `1px` // 把点九图原图周边的1像素剪裁掉
    }

    this.chunkData.width = property?.Width ?? 0
    this.chunkData.height = property?.Height ?? 0
    return this.chunkData
  }

  /**
   * 获取序列化点九图chunk
   * @returns type.NpTcChunkType
   */
  async getSerializedChunkData(): Promise<type.NpTcChunkType> {
    const buffer = await this.getBuffer()
    const chunks = extract(new Uint8Array(buffer))

    const npTc = chunks.find((chunk: type.Chunk) => chunk.name === type.NinePatchChunkName.Name)

    this.chunkData.padding = {
      left: npTc?.data[NpTcChunkPosition.PaddingLeft],
      right: npTc?.data[NpTcChunkPosition.PaddingRight],
      top: npTc?.data[NpTcChunkPosition.PaddingTop],
      bottom: npTc?.data[NpTcChunkPosition.PaddingBottom]
    }

    this.chunkData.xDivs = {
      start: npTc?.data[NpTcChunkPosition.xDivsStart],
      stop: npTc?.data[NpTcChunkPosition.xDivsStop]
    }

    this.chunkData.yDivs = {
      start: npTc?.data[NpTcChunkPosition.yDivsStart],
      stop: npTc?.data[NpTcChunkPosition.yDivsStop]
    }

    return this.chunkData
  }

  async getNotSerializedChunkData(width: number, height: number): Promise<type.NpTcChunkType> {
    const context = await this.getCanvasCtx()

    // 获取上边框分区
    const topSide = Array.from(context.getImageData(0, 0, width - 1, 1).data)
    const cornerColor = util.rgba2Color(topSide[0], topSide[1], topSide[2], topSide[3])
    const topSegment = util.getSegment(topSide.slice(4), cornerColor)

    // 获取左边框分区
    const leftSide = Array.from(context.getImageData(0, 1, 1, height - 2).data)
    const leftSegment = util.getSegment(leftSide, cornerColor)

    // 获取右边框分区
    const rightSide = Array.from(context.getImageData(width - 1, 1, 1, height - 2).data)
    const rightSegment = util.getSegment(rightSide, cornerColor)
    const firstRightSegment = rightSegment[0]
    const lastRightSegment = rightSegment[rightSegment.length - 1]
    this.chunkData.padding.top =
      firstRightSegment.type === type.SegmentColorType.Black ? 0 : firstRightSegment.width
    this.chunkData.padding.bottom =
      lastRightSegment.type === type.SegmentColorType.Black ? 0 : lastRightSegment.width

    // 获取下边框分区
    const bottomSide = Array.from(context.getImageData(1, height - 1, width - 2, 1).data)
    const bottomSegment = util.getSegment(bottomSide, cornerColor)
    const firstBottomSegment = bottomSegment[0]
    const lastBottomSegment = bottomSegment[bottomSegment.length - 1]
    this.chunkData.padding.left =
      firstBottomSegment.type === type.SegmentColorType.Black ? 0 : firstBottomSegment.width
    this.chunkData.padding.right =
      lastBottomSegment.type === type.SegmentColorType.Black ? 0 : lastBottomSegment.width

    this.chunkData.xDivs = util.getBlackLineData(topSegment)
    this.chunkData.yDivs = util.getBlackLineData(leftSegment)
    return this.chunkData
  }
}

export { type, NinePatchCore }
