import {
  ChangeEvent,
  PointerEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  Download,
  ImageUp,
  RotateCcw,
  Trash2,
  ScanFace,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react"
import { PAPERS, renderPhoto, renderSheet, exportPng, layoutSheet } from "./photo"
import { cn } from "@/lib/utils"
import {
  TextureCard,
  TextureCardContent,
  TextureCardDescription,
  TextureCardHeader,
  TextureCardTitle,
  TextureSeparator,
} from "@/components/ui/texture-card"
import { TextureButton } from "@/components/ui/texture-button"
import { HaloDropzone } from "@/components/ui/halo-dropzone"
import { RollingNumber } from "@/components/ui/rolling-number"

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

const NAME_MAX = 40

const WELL =
  "bg-neutral-950 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)]"

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: (labelId: string) => ReactNode
}) {
  const id = useId()
  return (
    <div>
      <p id={id} className="text-sm font-medium text-neutral-100">
        {label}
      </p>
      {hint && <p className="mt-0.5 text-xs text-neutral-400">{hint}</p>}
      <div className="mt-2.5">{children(id)}</div>
    </div>
  )
}

/* segmented control: one pressed option, a sliding raised bubble marks it */
function Segmented<T extends string | number>({
  labelledBy,
  value,
  options,
  onChange,
}: {
  labelledBy: string
  value: T
  options: readonly (readonly [T, string])[]
  onChange: (value: T) => void
}) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className={cn(
        "grid auto-cols-fr grid-flow-col gap-1 rounded-[14px] p-1",
        WELL,
      )}
    >
      {options.map(([option, text]) => {
        const on = option === value
        return (
          <button
            key={String(option)}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option)}
            className={cn(
              "relative rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
              on ? "text-white" : "text-neutral-400 hover:text-neutral-100",
            )}
          >
            {on && (
              <motion.span
                layoutId={`segment-${labelledBy}`}
                className="absolute inset-0 rounded-[10px] border border-white/10 bg-gradient-to-b from-neutral-700 to-neutral-800 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_2px_6px_rgba(0,0,0,0.5)]"
                transition={{ type: "spring", bounce: 0.19, duration: 0.4 }}
              />
            )}
            <span className="relative">{text}</span>
          </button>
        )
      })}
    </div>
  )
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked
          ? "bg-indigo-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
          : "bg-neutral-800 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-gradient-to-b from-white to-neutral-200 shadow-[0_2px_4px_rgba(0,0,0,0.4)] transition-transform duration-200 ease-out",
          checked && "translate-x-5",
        )}
      />
    </button>
  )
}

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
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = "high"
    context.drawImage(offscreen, 0, 0, displayWidth, displayHeight)
  }, [image, imageUrl, zoom, position, size, hasName, name, format, paper, dpi])

  const loadFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImage(null)
      setImageUrl((current) => {
        if (current) URL.revokeObjectURL(current)
        return ""
      })
      setError(
        `${file.name || "That file"} isn't a JPG, PNG or WebP. Choose a supported image.`,
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
      setError("This image couldn't be read. Try a different file.")
    }

    nextImage.src = nextUrl
  }

  const removePhoto = () => {
    setImage(null)
    setImageUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return ""
    })
    setZoom(1)
    setPosition({ x: 50, y: 50 })
    setError("")
  }

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    event.target.value = ""

    if (file) loadFile(file)
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

  const pixelW = sheetLayout ? sheetLayout.pageW : size * dpi
  const pixelH = sheetLayout ? sheetLayout.pageH : size * dpi

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg"
            aria-label="ID Photo Studio home"
          >
            <span className="grid size-9 place-items-center rounded-[10px] border border-white/10 bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_2px_6px_rgba(0,0,0,0.5)]">
              <ScanFace className="size-[18px] text-white" strokeWidth={1.75} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              ID Photo Studio
            </span>
          </a>
          <p className="flex items-center gap-2 text-sm text-neutral-400">
            <ShieldCheck className="size-4 text-indigo-300" strokeWidth={1.75} />
            <span className="sm:hidden">On-device</span>
            <span className="hidden sm:inline">
              Processed on your device. Nothing is uploaded.
            </span>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-balance text-neutral-50 sm:text-4xl">
          Print-ready ID photos, made on your device.
        </h1>
        <p className="mt-2 max-w-4xl text-base leading-7 text-neutral-400">
          Line up your portrait, then download an exact 1&times;1 or 2&times;2
          inch print, single or 4-up, with an optional name strip.
        </p>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
          <TextureCard>
            <TextureCardHeader className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 sm:px-6">
              <div className="min-w-[14rem] flex-1">
                <TextureCardTitle className="pl-0 text-base">Photo</TextureCardTitle>
                <TextureCardDescription className="pl-0">
                  {imageUrl
                    ? "Drag to reposition, or use the arrow keys."
                    : "Start with a front-facing portrait in even light."}
                </TextureCardDescription>
              </div>
              {imageUrl && (
                <div className="flex shrink-0 gap-2">
                  <TextureButton
                    variant="minimal"
                    size="sm"
                    className="w-auto"
                    onClick={() => inputRef.current?.click()}
                  >
                    <span className="flex items-center gap-1.5 py-1 text-neutral-100">
                      <ImageUp className="size-3.5" />
                      Replace
                    </span>
                  </TextureButton>
                  <TextureButton
                    variant="minimal"
                    size="sm"
                    className="w-auto"
                    onClick={removePhoto}
                  >
                    <span className="flex items-center gap-1.5 py-1 text-neutral-100">
                      <Trash2 className="size-3.5" />
                      Remove
                    </span>
                  </TextureButton>
                </div>
              )}
              <input
                ref={inputRef}
                className="hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={upload}
              />
            </TextureCardHeader>

            <TextureCardContent className="px-5 pb-6 sm:px-6">
              {/* cap the stage so stage + zoom row fit the first viewport on laptop screens */}
              <div className="mx-auto max-w-[min(620px,max(320px,calc(100svh-380px)))]">
                <div
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-2xl select-none",
                    WELL,
                    imageUrl && "cursor-grab touch-none active:cursor-grabbing",
                  )}
                  onPointerDown={startDrag}
                  onPointerMove={drag}
                  onPointerUp={() => (dragRef.current = null)}
                  onPointerCancel={() => (dragRef.current = null)}
                  onLostPointerCapture={() => (dragRef.current = null)}
                  tabIndex={imageUrl ? 0 : -1}
                  aria-label={
                    imageUrl ? "Photo position. Drag or use arrow keys." : undefined
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
                  {imageUrl ? (
                    <>
                      {/* wrapper carries the settle animation so it never overrides the zoom transform */}
                      <div key={imageUrl} className="settle absolute inset-0">
                        <img
                          src={imageUrl}
                          alt="Uploaded portrait"
                          draggable={false}
                          className="pointer-events-none h-full w-full object-cover"
                          style={{
                            objectPosition: `${position.x}% ${position.y}%`,
                            transform: `scale(${zoom})`,
                          }}
                        />
                      </div>
                      {/* guides carry a dark hairline so they read on light and dark photos */}
                      <div className="pointer-events-none absolute inset-[8%] border border-white/70 shadow-[0_0_0_1px_rgba(10,10,10,0.3)]">
                        <span className="absolute top-[13%] left-1/2 h-[56%] w-[56%] -translate-x-1/2 rounded-full border-2 border-indigo-400 shadow-[0_0_0_1px_rgba(10,10,10,0.35),inset_0_0_0_1px_rgba(10,10,10,0.35)]" />
                        <span className="absolute top-[69%] right-0 left-0 h-px bg-white/70 shadow-[0_1px_0_rgba(10,10,10,0.3)]" />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 p-2">
                      <HaloDropzone
                        className="h-full max-w-none"
                        accept="image/jpeg,image/png,image/webp"
                        onFiles={(files) => files[0] && loadFile(files[0])}
                        emptyLabel="Drop a portrait here, or browse"
                        formatHint="JPG, PNG or WebP. It stays on this device."
                        successLabel="Opening portrait"
                        showSuccessThumbnails={false}
                        idleIcon={<ImageUp className="size-5" strokeWidth={1.75} />}
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm leading-6 text-amber-100"
                  >
                    <TriangleAlert
                      className="mt-1 size-4 shrink-0 text-amber-400"
                      strokeWidth={2}
                    />
                    {error}
                  </p>
                )}

                <div
                  className={cn(
                    "mt-5 flex items-center gap-4 transition-opacity",
                    !imageUrl && "opacity-40",
                  )}
                >
                  <label
                    htmlFor="zoom"
                    className="text-xs font-medium text-neutral-400"
                  >
                    Zoom
                  </label>
                  <input
                    id="zoom"
                    type="range"
                    min="1"
                    max="2.4"
                    step="0.01"
                    value={zoom}
                    disabled={!imageUrl}
                    onChange={(event) => setZoom(Number(event.target.value))}
                  />
                  <span className="w-10 text-right font-mono text-xs text-neutral-400 tabular-nums">
                    {Math.round(zoom * 100)}%
                  </span>
                  <TextureButton
                    variant="minimal"
                    size="sm"
                    className="w-auto shrink-0 disabled:pointer-events-none"
                    disabled={!imageUrl}
                    onClick={() => {
                      setZoom(1)
                      setPosition({ x: 50, y: 50 })
                    }}
                  >
                    <span className="flex items-center gap-1.5 py-1 text-neutral-100">
                      <RotateCcw className="size-3.5" />
                      Reset
                    </span>
                  </TextureButton>
                </div>
              </div>
            </TextureCardContent>
          </TextureCard>

          <TextureCard>
            <TextureCardHeader className="px-5 sm:px-6">
              <TextureCardTitle className="pl-0 text-base">
                Print settings
              </TextureCardTitle>
              <TextureCardDescription className="pl-0">
                Match the size your application asks for.
              </TextureCardDescription>
            </TextureCardHeader>

            <TextureCardContent className="flex flex-col gap-5 px-5 pb-6 sm:px-6">
              <Field label="Photo size">
                {(id) => (
                  <Segmented
                    labelledBy={id}
                    value={size}
                    onChange={setSize}
                    options={[
                      [1, "1 × 1 in"],
                      [2, "2 × 2 in"],
                    ]}
                  />
                )}
              </Field>

              <Field label="Print format">
                {(id) => (
                  <Segmented
                    labelledBy={id}
                    value={format}
                    onChange={setFormat}
                    options={[
                      ["single", "Single photo"],
                      ["sheet", "4-up sheet"],
                    ]}
                  />
                )}
              </Field>

              <AnimatePresence initial={false}>
                {format === "sheet" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="-my-3 overflow-hidden py-3"
                  >
                    <Field label="Paper size" hint="Four copies with cut guides.">
                      {(id) => (
                        <Segmented
                          labelledBy={id}
                          value={paper}
                          onChange={setPaper}
                          options={[
                            ["a4", "A4"],
                            ["letter", "US Letter"],
                          ]}
                        />
                      )}
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>

              <TextureSeparator />

              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-100">
                      Name strip
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      Your name printed in capitals below the photo.
                    </p>
                  </div>
                  <Switch
                    checked={hasName}
                    onChange={setHasName}
                    label="Add name strip"
                  />
                </div>
                {hasName && (
                  <div className="mt-4">
                    <label htmlFor="name" className="sr-only">
                      Name on the strip
                    </label>
                    <input
                      id="name"
                      value={name}
                      maxLength={NAME_MAX}
                      placeholder="YOUR NAME"
                      autoComplete="name"
                      onChange={(event) =>
                        setName(event.target.value.toUpperCase())
                      }
                      className={cn(
                        "w-full rounded-xl border border-white/[0.06] px-4 py-3 text-[15px] font-medium tracking-wide text-neutral-50 transition outline-none placeholder:text-[#8f8f8f] focus:border-indigo-400/60",
                        WELL,
                      )}
                    />
                    <p className="mt-2 text-right font-mono text-xs text-neutral-400 tabular-nums">
                      {name.length}/{NAME_MAX}
                    </p>
                  </div>
                )}
              </div>

              <Field label="Resolution">
                {(id) => (
                  <Segmented
                    labelledBy={id}
                    value={dpi}
                    onChange={setDpi}
                    options={[
                      [300, "300 dpi"],
                      [600, "600 dpi"],
                    ]}
                  />
                )}
              </Field>

              {/* preview + download stay pinned to the viewport bottom while the rail scrolls */}
              <div className="z-10 -mx-2 flex flex-col gap-4 rounded-[18px] bg-[#1b1b1b] p-2 lg:sticky lg:bottom-3 lg:shadow-[0_-10px_24px_rgba(10,10,10,0.55)]">
              <div className={cn("flex items-center gap-5 rounded-2xl p-4", WELL)}>
                {imageUrl ? (
                  <canvas
                    ref={previewRef}
                    role="img"
                    aria-label={
                      format === "single"
                        ? "Preview of single photo"
                        : "Preview of 4-up sheet"
                    }
                    className="h-32 w-auto shrink-0 rounded-[3px] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.6)]"
                  />
                ) : (
                  <div className="grid size-32 shrink-0 place-items-center rounded-xl border border-dashed border-white/15">
                    <ScanFace
                      className="size-8 text-neutral-600"
                      strokeWidth={1.25}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-100">
                    {format === "single"
                      ? `${size} × ${size} in photo`
                      : `4-up on ${paper === "a4" ? "A4" : "US Letter"}`}
                  </p>
                  <p className="mt-1.5 font-mono text-xs leading-5 text-neutral-400 tabular-nums">
                    <RollingNumber value={pixelW} /> ×{" "}
                    <RollingNumber value={pixelH} /> px
                    <br />
                    PNG at {dpi} dpi
                  </p>
                  {!imageUrl && (
                    <p className="mt-2 text-xs text-neutral-400">
                      Preview appears after you add a photo.
                    </p>
                  )}
                </div>
              </div>

              <TextureButton
                variant="primary"
                size="lg"
                disabled={!imageUrl}
                onClick={download}
                className="disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex items-center gap-2 py-1.5 font-semibold">
                  <Download className="size-4" strokeWidth={2} />
                  {format === "sheet" ? "Download 4-up sheet" : "Download photo"}
                </span>
              </TextureButton>
              </div>
            </TextureCardContent>
          </TextureCard>
        </div>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 text-xs text-neutral-400 sm:flex-row sm:justify-between sm:px-8">
          <span>ID Photo Studio</span>
          <span>Everything runs in your browser. Your photo never leaves this device.</span>
        </div>
      </footer>
    </div>
  )
}
