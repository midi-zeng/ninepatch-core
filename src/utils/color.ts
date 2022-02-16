export function rgba2hex(rgba: string): string {
  return rgba.split(',')?.reduce((acc: string, key: string) => {
    const hex = (Number(key) | (1 << 8)).toString(16).slice(1)
    acc = `${acc}${hex}`
    return acc
  }, '#')
}
