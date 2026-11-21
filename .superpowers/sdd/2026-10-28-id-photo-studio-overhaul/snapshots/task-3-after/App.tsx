import { ChangeEvent, PointerEvent, useEffect, useRef, useState } from "react"
import { PAPERS, renderPhoto, renderSheet, exportPng, layoutSheet } from "./photo"
type Position = {
  x: number
  y: number
}

type DragState = {
  x: number
  y: number
  position: Position
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]

const PREVIEW_DPI = 150 // preview renders at capped dpi so a 600 dpi A4 sheet never re-renders per keystroke

const UploadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const DownloadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/* yellow triangle: the attention mark */
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0">
    <path
      d="M12 3.5 21.5 20h-19L12 3.5Z"
      fill="#f0b429"
      stroke="#17150f"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
)

/* the mechanism drawn as a bauhaus composition: blue square frame,
   red circle where the head goes, ink chin line */
const CompositionMark = () => (
  <span aria-hidden="true" className="relative block h-36 w-36 sm:h-44 sm:w-44">
    <span className="absolute inset-0 border-2 border-structure" />
    <span className="absolute left-1/2 top-[18%] h-[54%] w-[54%] -translate-x-1/2 rounded-full border-2 border-active" />
    <span className="absolute inset-x-[14%] top-[74%] border-t-2 border-ink" />
    <span className="absolute bottom-[8%] left-[8%] h-0 w-0 border-x-[7px] border-b-[12px] border-x-transparent border-b-alert" />
  </span>
)

export default function App() {
  const [imageUrl, setImageUrl] = useState("")

  const [image, setImage] = useState<HTMLImageElement | null>(null)

  const [size, setSize] = useState<1 | 2>(2)

  const [format, setFormat] = useState<"single" | "sheet">("single")

  const [paper, setPaper] = useState<"a4" | "letter">("a4")

  const [dpi, setDpi] = useState<300 | 600>(300)
  const [hasName, setHasName] = useState(true)

  const [name, setName] = useState("")

  const [zoom, setZoom] = useState(1)

  const [position, setPosition] = useState<Position>({ x: 50, y: 50 })

  const [error, setError] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)

  const dragRef = useRef<DragState | null>(null)

  const previewRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = previewRef.current
    if (!image || !canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const crop = { zoom, position }
    const offscreen =
      format === "single"
        ? renderPhoto(image, size, PREVIEW_DPI, hasName, name, crop)
        : renderSheet(image, size, paper, PREVIEW_DPI, hasName, name, crop)

    let displayWidth: number
    let displayHeight: number
    if (format === "single") {
      displayWidth = 360
      displayHeight = 360
    } else {
      const paperSpec = PAPERS[paper]
      displayHeight = 420
      displayWidth = Math.round(displayHeight * (paperSpec.wIn / paperSpec.hIn))
    }

    canvas.width = displayWidth
    canvas.height = displayHeight
    context.clearRect(0, 0, displayWidth, displayHeight)
    context.drawImage(offscreen, 0, 0, displayWidth, displayHeight)
  }, [image, imageUrl, zoom, position, size, hasName, name, format, paper, dpi])

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    event.target.value = ""

    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImage(null)
      setImageUrl("")
      setError(
        `${file.name || "that file"} isn't a jpg, png or webp — choose a supported image.`,
      )
      return
    }

    const nextUrl = URL.createObjectURL(file)

    const nextImage = new Image()

    nextImage.onload = () => {
      setImage(nextImage)

      setImageUrl((current) => {
        // revoke the previous url here, never in an effect cleanup — strict mode's
        // mount/cleanup/mount cycle would revoke the url the <img> is still loading
        if (current) URL.revokeObjectURL(current)

        return nextUrl
      })

      setZoom(1)

      setPosition({ x: 50, y: 50 })

      setError("")
    }

    nextImage.onerror = () => {
      URL.revokeObjectURL(nextUrl)
      setError("this image couldn't be read — try a different file.")
    }

    nextImage.src = nextUrl
  }

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!imageUrl) return

    event.currentTarget.setPointerCapture(event.pointerId)

    dragRef.current = { x: event.clientX, y: event.clientY, position }
  }

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return

    const rect = event.currentTarget.getBoundingClientRect()

    const dx = ((event.clientX - dragRef.current.x) / rect.width) * 100

    const dy = ((event.clientY - dragRef.current.y) / rect.height) * 100

    setPosition({
      x: Math.max(0, Math.min(100, dragRef.current.position.x - dx)),

      y: Math.max(0, Math.min(100, dragRef.current.position.y - dy)),
    })
  }

  const download = () => {
    if (!image) return

    const canvas =
      format === "single"
        ? renderPhoto(image, size, dpi, hasName, name, { zoom, position })
        : renderSheet(image, size, paper, dpi, hasName, name, { zoom, position })

    const filename =
      format === "single"
        ? `${size}x${size}-id-photo${hasName ? "-with-name" : ""}.png`
        : `4up-${size}x${size}-${paper === "a4" ? "a4" : "letter"}-sheet.png`

    exportPng(canvas, filename)
  }

  const sheetLayout =
    format === "sheet" ? layoutSheet(PAPERS[paper], size, dpi) : null

  return (
    <main className="baseline-grid min-h-screen bg-white text-ink">
      <header className="border-b border-ink bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="#"
            className="flex items-center gap-3"
            aria-label="id photo studio home"
          >
            <span className="grid h-9 w-9 place-items-center bg-ink">
              <span className="h-4 w-4 rounded-full bg-active" />
            </span>
            <span className="text-lg font-semibold lowercase tracking-[-0.02em]">
              id photo studio
            </span>
          </a>
          <span className="hidden text-sm text-ink/70 sm:block">
            private by design &mdash; photos stay on your device
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8 sm:pt-12">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-semibold lowercase leading-[1.02] tracking-[-0.03em] sm:text-7xl">
            compose your id photo.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-ink/75 sm:text-lg">
            upload a portrait, drag it into balance, and download a crisp
            1&times;1 or 2&times;2 print &mdash; single or a 4-up sheet &mdash;
            with an optional name strip.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
          <section className="border border-ink bg-white p-5 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold lowercase">
                {imageUrl
                  ? "photo editor — drag to reposition"
                  : "photo editor"}
              </p>
              {imageUrl && (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2 border border-ink px-4 py-2 text-sm font-semibold lowercase transition hover:bg-ink hover:text-white"
                >
                  <UploadIcon />
                  replace
                </button>
              )}
              <input
                ref={inputRef}
                className="hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={upload}
              />
            </div>

            <div className="mx-auto max-w-[520px]">
              <div
                className={`relative aspect-square select-none overflow-hidden border-2 border-structure bg-white ${
                  imageUrl
                    ? "cursor-grab touch-none active:cursor-grabbing"
                    : ""
                }`}
                onPointerDown={startDrag}
                onPointerMove={drag}
                onPointerUp={() => (dragRef.current = null)}
                onPointerCancel={() => (dragRef.current = null)}
                onLostPointerCapture={() => (dragRef.current = null)}
                tabIndex={imageUrl ? 0 : -1}
                aria-label={
                  imageUrl
                    ? "photo position — drag or use arrow keys"
                    : undefined
                }
                onKeyDown={(event) => {
                  if (!imageUrl) return

                  /* arrows move the photo like a drag: right reveals more of the left */
                  const moves: Record<string, readonly [number, number]> = {
                    ArrowLeft: [1, 0],
                    ArrowRight: [-1, 0],
                    ArrowUp: [0, 1],
                    ArrowDown: [0, -1],
                  }

                  const move = moves[event.key]

                  if (!move) return

                  event.preventDefault()

                  const step = event.shiftKey ? 6 : 2

                  setPosition((current) => ({
                    x: Math.max(0, Math.min(100, current.x + move[0] * step)),
                    y: Math.max(0, Math.min(100, current.y + move[1] * step)),
                  }))
                }}
              >
                {/* empty state stays mounted; it translates out when a photo slides in */}
                <div
                  aria-hidden={!!imageUrl}
                  className={`square-grid absolute inset-0 flex items-center justify-center transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    imageUrl
                      ? "pointer-events-none -translate-x-full opacity-0"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => inputRef.current?.click()}
                    tabIndex={imageUrl ? -1 : 0}
                    className="flex h-fit w-fit flex-col items-center text-center"
                  >
                    <CompositionMark />
                    <span className="mt-6 text-base font-semibold lowercase">
                      choose a portrait
                    </span>
                    <span className="mt-1 text-sm text-ink/70">
                      jpg, png or webp
                    </span>
                  </button>
                </div>

                {imageUrl && (
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt="uploaded id photo"
                    draggable={false}
                    className="slide-in pointer-events-none absolute inset-0 h-full w-full object-cover"
                    style={{
                      objectPosition: `${position.x}% ${position.y}%`,
                      transform: `scale(${zoom})`,
                    }}
                  />
                )}

                {imageUrl && (
                  <div className="pointer-events-none absolute inset-[8%] border border-ink/80">
                    <span className="absolute left-1/2 top-[13%] h-[56%] w-[56%] -translate-x-1/2 rounded-full border-2 border-active" />
                    <span className="absolute left-0 right-0 top-[69%] border-t border-ink/80" />
                  </div>
                )}
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 flex items-start gap-2 text-sm leading-6 text-ink"
                >
                  <AlertIcon />
                  {error}
                </p>
              )}

              <div
                className={`mt-5 flex items-center gap-4 ${
                  imageUrl ? "" : "opacity-40"
                }`}
              >
                <span className="text-xs font-semibold lowercase text-ink/70">
                  zoom
                </span>
                <input
                  aria-label="photo zoom"
                  type="range"
                  min="1"
                  max="2.4"
                  step="0.01"
                  value={zoom}
                  disabled={!imageUrl}
                  onChange={(event) => setZoom(Number(event.target.value))}
                />
                <button
                  onClick={() => {
                    setZoom(1)
                    setPosition({ x: 50, y: 50 })
                  }}
                  disabled={!imageUrl}
                  className="ml-auto whitespace-nowrap text-xs font-semibold text-active lowercase hover:underline"
                >
                  reset crop
                </button>
              </div>
            </div>
          </section>

          <aside className="border border-ink bg-white p-5 sm:p-7">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-semibold lowercase tracking-[-0.02em]">
                set up your photo
              </h2>
            </div>

            <div className="mt-7">
              <label className="text-sm font-semibold lowercase">
                photo size
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {([1, 2] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setSize(value)}
                    aria-pressed={size === value}
                    className={`border px-3 py-3 text-sm font-semibold lowercase transition ${
                      size === value
                        ? "border-active bg-active text-white"
                        : "border-ink/30 text-ink/75 hover:border-ink"
                    }`}
                  >
                    {value} &times; {value} inch
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <label className="text-sm font-semibold lowercase">
                print format
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(
                  [
                    ["single", "single photo"],
                    ["sheet", "4-up sheet"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFormat(value)}
                    aria-pressed={format === value}
                    className={`border px-3 py-3 text-sm font-semibold lowercase transition ${
                      format === value
                        ? "border-active bg-active text-white"
                        : "border-ink/30 text-ink/75 hover:border-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {format === "sheet" && (
              <div className="mt-7">
                <label className="text-sm font-semibold lowercase">
                  paper size
                </label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(
                    [
                      ["a4", "a4"],
                      ["letter", "us letter"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setPaper(value)}
                      aria-pressed={paper === value}
                      className={`border px-3 py-3 text-sm font-semibold lowercase transition ${
                        paper === value
                          ? "border-active bg-active text-white"
                          : "border-ink/30 text-ink/75 hover:border-ink"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-ink/15 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold lowercase">
                    add name strip
                  </p>
                  <p className="mt-1 text-xs text-ink/70">
                    your name printed below the photo
                  </p>
                </div>
                <button
                  aria-label="toggle name strip"
                  aria-pressed={hasName}
                  onClick={() => setHasName(!hasName)}
                  className={`relative h-5 w-10 transition ${
                    hasName ? "bg-active" : "bg-ink/20"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-0.5 h-4 w-4 bg-white shadow-sm transition ${
                      hasName ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              {hasName && (
                <div className="mt-5">
                  <label
                    htmlFor="name"
                    className="text-xs font-semibold lowercase text-ink/70"
                  >
                    name on the strip
                  </label>
                  <input
                    id="name"
                    value={name}
                    maxLength={40}
                    placeholder="your name"
                    onChange={(event) =>
                      setName(event.target.value.toUpperCase())
                    }
                    className="mt-2 w-full border border-ink/30 bg-white px-4 py-3 text-base font-semibold outline-none transition placeholder:text-ink/40 focus:border-ink"
                  />
                </div>
              )}
            </div>

            <div className="mt-7">
              <label className="text-sm font-semibold lowercase">
                resolution
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {([300, 600] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setDpi(value)}
                    aria-pressed={dpi === value}
                    className={`border px-3 py-3 text-sm font-semibold lowercase transition ${
                      dpi === value
                        ? "border-active bg-active text-white"
                        : "border-ink/30 text-ink/75 hover:border-ink"
                    }`}
                  >
                    {value} dpi
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 border-t border-ink/15 pt-6">
              <p className="mb-4 text-sm font-semibold lowercase">preview</p>
              <div className="flex items-center gap-5 bg-ink/[0.04] p-4">
                {imageUrl ? (
                  <canvas
                    ref={previewRef}
                    role="img"
                    aria-label={
                      format === "single"
                        ? "preview of single photo"
                        : "preview of 4-up sheet"
                    }
                    className="border border-ink/40 bg-white shadow-[0_10px_24px_rgba(23,21,15,0.14)]"
                  />
                ) : (
                  <div className="grid place-items-center border border-ink/40 bg-white p-4 shadow-[0_10px_24px_rgba(23,21,15,0.14)]">
                    <CompositionMark />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold lowercase">
                    {format === "single"
                      ? `${size} × ${size} inch png — ${size * dpi} × ${size * dpi} pixels`
                      : `4-up on ${PAPERS[paper].label.toLowerCase()} — ${sheetLayout!.pageW} × ${sheetLayout!.pageH} pixels`}
                  </p>
                </div>
              </div>
            </div>

            <button
              disabled={!imageUrl}
              onClick={download}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-active px-5 py-3.5 text-sm font-semibold text-white lowercase transition hover:bg-[#b93a2a] disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40"
            >
              <DownloadIcon />
              {format === "sheet" ? "download 4-up sheet" : "download photo"}
            </button>
          </aside>
        </div>
      </section>
    </main>
  )
}
