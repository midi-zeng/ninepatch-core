export interface NpTcChunkPadding {
  left: number
  right: number
  top: number
  bottom: number
}

export interface NpTcChunkDiv {
  start: number
  stop: number
}

export interface NpTcChunkType {
  padding: NpTcChunkPadding
  xDivs: NpTcChunkDiv
  yDivs: NpTcChunkDiv
  width?: number
  height?: number
  clipPath?: string // 点九图原图剪裁像素 1px
}

export interface NinePatchPreloadReq {
  src?: string
  file?: File
}

export enum NinePatchImageType {
  None = 0, // 非点九图
  Noterialized = 1, // 点九图原图(带黑边)
  Serialized = 2 // 经过AAPT编译后的点九图
}

export enum ImageHax {
  JPG = 'ffd8ff',
  PNG = '89504e47',
  GIT = '47494638',
  TIF = '49492a00',
  BMP = '424d'
}
export interface ImageProperty {
  Width: number
  Height: number
  Hex: string
}

export enum Color {
  Transparent = '0,0,0,0',
  Black = '0,0,0,255'
}

export enum PixelsSide {
  Left = 'left',
  Right = 'right',
  Top = 'top',
  Bottom = 'bottom'
}

export interface PixelsSideData {
  [PixelsSide.Left]: number[]
  [PixelsSide.Right]: number[]
  [PixelsSide.Top]: number[]
  [PixelsSide.Bottom]: number[]
}

export const PixelsSideLabel: Record<string, string> = {
  [PixelsSide.Left]: '左边框',
  [PixelsSide.Right]: '右边框',
  [PixelsSide.Top]: '顶部边框',
  [PixelsSide.Bottom]: '底部边框'
}

export interface CheckColorRes {
  status: boolean // 是否是未编译的点九图
  msg?: string[] // 异常信息
}

export enum SegmentColorType {
  Transparent = 0,
  Black = 1
}

export interface Segment {
  type: SegmentColorType // 0: 透明 1:黑边
  width: number
  start: number
}

export interface SerializedData {
  topSegment: Segment[]
  leftSegment: Segment[]
  padding: NpTcChunkPadding
}

export interface Chunk {
  name: string
  data: number[]
}

// https://android.googlesource.com/platform/frameworks/base.git/+/master/tools/aapt/Images.cpp#1249
export enum NinePatchChunkName {
  Name = 'npTc'
}
