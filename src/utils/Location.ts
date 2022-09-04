function moveToPage(path: string) {
  window.location.href = path
}

function openTab(path: string) {
  window.open(path, "_blank")
}
  
export { moveToPage, openTab }
