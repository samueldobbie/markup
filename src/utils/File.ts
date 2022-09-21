import { IFile } from "constants/File"

function readFile(file: Blob, callback: (e: any) => void): void {
  const reader = new FileReader()
  reader.onload = callback
  reader.readAsText(file)
}

function readFileAsync(file: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => { resolve(reader.result) }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

async function readFiles(files: FileList) {
  const data = [] as IFile[]
  
  for (let i = 0; i < files.length; i++) {
    const fileText = await readFileAsync(files[i])
    const content = {
      "name": files[i].name,
      "content": fileText as string,
    }

    data.push(content)
  }

  return data
}

export { readFile, readFileAsync, readFiles }
