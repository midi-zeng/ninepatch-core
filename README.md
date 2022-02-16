# ninepatch-core

- 解析AAPT编译出来的点九图npTc chunk数据

## 安装

```js
yarn add ninepatch-core
```

## 使用方式
```typescript
enum NinePatchImageType {
  None = 0, // 非点九图
  Noterialized = 1, // 点九图原图(带黑边)
  Serialized = 2 // 经过AAPT编译后的点九图
}

interface SerializedData {
  topSegment: Segment[]
  leftSegment: Segment[]
  padding: NpTcChunkPadding
}

interface Segment {
  type: SegmentColorType // 0: 透明 1:黑边
  width: number
  start: number
}

interface NpTcChunkPadding {
  left: number
  right: number
  top: number
  bottom: number
}

enum SegmentColorType {
  Transparent = 0,
  Black = 1
}

interface NpTcChunkDiv {
  start: number
  stop: number
}

interface NpTcChunkType {
  padding: NpTcChunkPadding
  xDivs: NpTcChunkDiv
  yDivs: NpTcChunkDiv
  width?: number
  height?: number
  clipPath?: string // 点九图原图剪裁像素 1px
}

// 实例化解析器，可以传src或File对象，二选一
const np = new NinePatchPreloader({ src: '图片地址', file: '图片File对象' })

async function boostrap() {
  // chunk相关数据
  const chunkData: NpTcChunkType = await np.getChunkData()

  // todo 相关渲染逻辑，如border-image点九图渲染
}
```