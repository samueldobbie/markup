export function exportFileNames(documentNames: string[], extension: string): string[] {
  const used = new Set<string>()

  return documentNames.map((documentName) => {
    const stem = documentName.replace(/\.txt$/i, "")
    let name = `${stem}${extension}`

    for (let suffix = 2; used.has(name.toLowerCase()); suffix++) {
      name = `${stem}-${suffix}${extension}`
    }

    used.add(name.toLowerCase())
    return name
  })
}
