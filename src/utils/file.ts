export function isFile(file: File | string | null): boolean {
  return Object.prototype.toString.call(file) === '[object File]'
}

export async function getFileByUrl(url: string): Promise<File> {
  return new Promise(resolve => {
    const requestor = new XMLHttpRequest()
    requestor.open('GET', url, true)
    requestor.responseType = 'blob'

    requestor.onload = function () {
      resolve(new File([requestor.response], ''))
    }

    requestor.send()
  })
}

export async function getFileArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise(resolve => {
    const fr = new FileReader()

    fr.onload = () => {
      resolve(fr.result as ArrayBuffer)
    }

    fr.readAsArrayBuffer(file)
  })
}
