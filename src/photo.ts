export type CropSpec = { zoom: number; position: { x: number; y: number } }

export const PAPERS = {
  a4: { wIn: 8.27, hIn: 11.69, label: "A4" },
  letter: { wIn: 8.5, hIn: 11, label: "Letter" },
} as const

export type PaperKey = keyof typeof PAPERS

export function layoutSheet(
  paperIn: { wIn: number; hIn: number },
  sizeIn: 1 | 2,
  dpi: number,
): {
  pageW: number
  pageH: number
  cell: number
  cells: { x: number; y: number }[]
  gap: number
} {
  const pageW = Math.round(paperIn.wIn * dpi)
  const pageH = Math.round(paperIn.hIn * dpi)
  const cell = sizeIn * dpi
  // tight print-shop packing: 5mm margin at the top-left, ~2mm cut gap between copies
  const margin = Math.max(0, Math.round(0.2 * dpi))
  const gap = Math.max(0, Math.round(0.08 * dpi))
  const stride = cell + gap
  const cells = [
    { x: margin, y: margin },
    { x: margin + stride, y: margin },
    { x: margin + stride, y: margin + stride },
    { x: margin, y: margin + stride },
  ]
  return { pageW, pageH, cell, cells, gap }
}

export function drawResampled(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"

  let src: HTMLImageElement | HTMLCanvasElement = image
  const dims = (s: HTMLImageElement | HTMLCanvasElement) =>
    "naturalWidth" in s
      ? { w: (s as HTMLImageElement).naturalWidth, h: (s as HTMLImageElement).naturalHeight }
      : { w: (s as HTMLCanvasElement).width, h: (s as HTMLCanvasElement).height }

  let srcWidth = dims(src).w
  while (w < srcWidth / 2) {
    const d = dims(src)
    const nextW = Math.max(1, Math.round(d.w / 2))
    const nextH = Math.max(1, Math.round(d.h / 2))
    const off = document.createElement("canvas")
    off.width = nextW
    off.height = nextH
    const octx = off.getContext("2d")
    if (!octx) break
    octx.imageSmoothingEnabled = true
    octx.imageSmoothingQuality = "high"
    octx.drawImage(src, 0, 0, nextW, nextH)
    src = off
    srcWidth = nextW
  }

  ctx.filter = "contrast(103.5%) saturate(104%)"
  ctx.drawImage(src, x, y, w, h)
  ctx.filter = "none"
}

export function renderPhoto(
  image: HTMLImageElement,
  sizeIn: 1 | 2,
  dpi: number,
  hasName: boolean,
  name: string,
  crop: CropSpec,
): HTMLCanvasElement {
  const outputSize = sizeIn * dpi

  const tagHeight = hasName ? Math.round(outputSize * 0.16) : 0

  const photoHeight = outputSize - tagHeight

  const canvas = document.createElement("canvas")

  canvas.width = outputSize

  canvas.height = outputSize

  const context = canvas.getContext("2d")

  if (!context) return canvas

  context.fillStyle = "#ffffff"

  context.fillRect(0, 0, outputSize, outputSize)

  /* match the editor: cover crop from position, then a center-anchored zoom */
  const base = Math.max(
    outputSize / image.naturalWidth,
    photoHeight / image.naturalHeight,
  )

  const baseWidth = image.naturalWidth * base

  const baseHeight = image.naturalHeight * base

  const x =
    -Math.max(0, baseWidth - outputSize) * (crop.position.x / 100) -
    (baseWidth * (crop.zoom - 1)) / 2

  const y =
    -Math.max(0, baseHeight - photoHeight) * (crop.position.y / 100) -
    (baseHeight * (crop.zoom - 1)) / 2

  drawResampled(context, image, x, y, baseWidth * crop.zoom, baseHeight * crop.zoom)

  if (hasName) {
    context.fillStyle = "#ffffff"

    context.fillRect(0, photoHeight, outputSize, tagHeight)

    context.fillStyle = "#17150f"

    context.textAlign = "center"

    context.textBaseline = "middle"

    const printedName = name.trim()

    if (printedName) {
      context.font = `700 ${Math.round(tagHeight * 0.5)}px Arial, sans-serif`

      context.fillText(
        printedName,
        outputSize / 2,
        photoHeight + tagHeight / 2,
        outputSize * 0.92,
      )
    }
  }

  return canvas
}

export function renderSheet(
  image: HTMLImageElement,
  sizeIn: 1 | 2,
  paperKey: "a4" | "letter",
  dpi: number,
  hasName: boolean,
  name: string,
  crop: CropSpec,
): HTMLCanvasElement {
  const paper = PAPERS[paperKey]
  const layout = layoutSheet(paper, sizeIn, dpi)

  const canvas = document.createElement("canvas")
  canvas.width = layout.pageW
  canvas.height = layout.pageH

  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, layout.pageW, layout.pageH)

  const photoCanvas = renderPhoto(image, sizeIn, dpi, hasName, name, crop)
  for (const cell of layout.cells) {
    ctx.drawImage(photoCanvas, cell.x, cell.y, layout.cell, layout.cell)
  }

  // cut guides: hairlines along the gap midlines, spanning the packed block
  // (they run inside the white gap channels, never across a photo)
  const m = layout.cells[0].x
  const stride = layout.cell + layout.gap
  const blockEnd = m + 2 * layout.cell + layout.gap
  const midX = m + layout.cell + layout.gap / 2
  const midY = m + layout.cell + layout.gap / 2
  ctx.lineWidth = Math.max(1, Math.round(dpi / 100))
  ctx.strokeStyle = "rgba(23,21,15,0.55)"
  ctx.beginPath()
  ctx.moveTo(midX, m)
  ctx.lineTo(midX, blockEnd)
  ctx.moveTo(m, midY)
  ctx.lineTo(blockEnd, midY)
  ctx.stroke()

  return canvas
}

export function exportPng(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement("a")

  link.download = filename

  link.href = canvas.toDataURL("image/png")

  link.click()
}
