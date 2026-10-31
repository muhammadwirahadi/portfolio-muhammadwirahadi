import { useEffect, useRef, useState, useMemo } from "react"

const EASE_PRESETS = {
  linear: "linear",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
}

function parseTransition(t) {
  const dur = Math.max(0.05, (t && t.duration) || 0.5)
  let ease = "cubic-bezier(0.44, 0, 0.56, 1)"
  if (t && Array.isArray(t.ease) && t.ease.length === 4) {
    ease = `cubic-bezier(${t.ease.join(", ")})`
  } else if (t && typeof t.ease === "string" && EASE_PRESETS[t.ease]) {
    ease = EASE_PRESETS[t.ease]
  } else if (t && t.type === "spring") {
    ease = "cubic-bezier(0.34, 1.56, 0.64, 1)"
  }
  return { dur, ease }
}

// Ikon SVG Kustom untuk teknologi
const TECH_ICONS = {
  React: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="2"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" strokeDasharray="3 3"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)"/>
    </svg>
  ),
  Nodejs: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  Express: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  PostgreSQL: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="M12 6v12M6 12h12"/>
    </svg>
  ),
  TailwindCSS: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z"/>
      <path d="M8 12h8"/>
    </svg>
  ),
  Vite: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 22h20L12 2z"/>
      <path d="M12 18h.01"/>
    </svg>
  ),
  RESTAPI: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Sequelize: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4.5 16.5c-1.5 1.25-2.5 3-2.5 5.5h20c0-2.5-1-4.25-2.5-5.5"/>
      <path d="M12 2v10M8 6l4-4 4 4"/>
    </svg>
  ),
  Swagger: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7"/>
    </svg>
  ),
  JavaScript: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3h18v18H3V3z"/>
      <path d="M15 15v3.5a1.5 1.5 0 0 1-3 0v-1"/>
      <path d="M9 15v3.5M10 15H8"/>
    </svg>
  ),
  PHP: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="M7 9h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H7v3M14 9v6M17 9h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2v3"/>
    </svg>
  ),
  Laravel: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  Laravel10: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  Vuejs: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3l10 17L22 3M6 3l6 10L18 3"/>
    </svg>
  ),
  Inertiajs: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17h14M8 12h8M11 7h2"/>
    </svg>
  ),
  MySQL: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6"/>
    </svg>
  ),
  GitHub: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  ),
  Nextjs: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9 8v8M9 8l7 9M15.5 8v4"/>
    </svg>
  ),
  PrismaORM: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 19l8 3 8-3L12 2z"/>
      <path d="M12 2v20"/>
    </svg>
  ),
  JWT: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>
  ),
  Nginx: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z"/>
      <path d="M9 16V8l6 8V8"/>
    </svg>
  ),
  PM2: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7"/>
      <path d="M21 4v5h-5"/>
    </svg>
  ),
  GitHubActions: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M10 8l6 4-6 4V8z"/>
    </svg>
  ),
  Tailwind: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z"/>
      <path d="M8 12h8"/>
    </svg>
  ),
}


// Logo asli (brand color) per teknologi - sumber sama dengan section Skills
// (Devicon via jsDelivr). Teknologi yang tidak ada di Devicon (JWT, PM2,
// Inertia) diambil dari Simple Icons CDN, yang juga dipakai di Summary.
// Key = nama teknologi tanpa spasi/titik (lihat TechIcon di bawah).
const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons"
const devicon = (name) => `${DEVICON_BASE}/${name}/${name}-original.svg`

const TECH_LOGOS = {
  PHP: devicon("php"),
  Laravel: devicon("laravel"),
  Laravel10: devicon("laravel"),
  Vuejs: devicon("vuejs"),
  Tailwind: devicon("tailwindcss"),
  MySQL: devicon("mysql"),
  PostgreSQL: devicon("postgresql"),
  GitHub: devicon("github"),
  Nextjs: devicon("nextjs"),
  PrismaORM: devicon("prisma"),
  Nginx: devicon("nginx"),
  GitHubActions: devicon("githubactions"),
  JWT: "https://cdn.simpleicons.org/jsonwebtokens",
  PM2: "https://cdn.simpleicons.org/pm2",
  Inertiajs: "https://cdn.simpleicons.org/inertia",
}

// Ikon teknologi untuk chip "Technologies Used". Logo asli ditaruh di kotak krem
// kecil supaya logo gelap (GitHub, Next.js, Prisma) tetap terbaca di kartu
// maroon. Kalau logo gagal dimuat (offline / CDN down), jatuh balik ke ikon
// SVG garis bawaan di TECH_ICONS.
function TechIcon({ name }) {
  const key = name.replace(/[^a-zA-Z0-9]/g, "")
  const logoUrl = TECH_LOGOS[key]
  const [failed, setFailed] = useState(false)

  if (!logoUrl || failed) return TECH_ICONS[key] || null

  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-cream p-1">
      <img
        src={logoUrl}
        alt=""
        draggable={false}
        className="h-full w-full object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  )
}

export default function MagneticCarousel({
  images = [],
  collapsedWidth = 120, // Diperlebar agar rasio landscape (screenshot web) lebih pas
  hoverWidth = 240,     // Diperlebar
  collapsedHeight = 240, // Diturunkan agar rasio pas
  hoverHeight = 280,     // Diturunkan
  openSizeWidth = 720,  // Landscape lebar ketika dibuka
  openSizeHeight = 440, // Landscape tinggi ketika dibuka
  gap = 14,
  influence = 180,
  blur = 3,
  transition = { type: "tween", duration: 0.35, ease: "easeInOut" },
  style = {},
}) {
  const count = images.length
  const containerRef = useRef(null)
  
  const [factors, setFactors] = useState(() => Array(count).fill(0))
  const [open, setOpen] = useState(null)
  const [closing, setClosing] = useState(false)

  // Target koordinat untuk lerp animasi dock
  const targetRef = useRef(Array(count).fill(0))
  const curRef = useRef(Array(count).fill(0))
  const loopRef = useRef(0)
  const closeTimer = useRef(0)

  useEffect(() => {
    targetRef.current = Array(count).fill(0)
    curRef.current = Array(count).fill(0)
    setFactors(Array(count).fill(0))
  }, [count])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(loopRef.current)
      clearTimeout(closeTimer.current)
    }
  }, [])

  const startLoop = () => {
    if (loopRef.current) return
    const step = () => {
      const tgt = targetRef.current
      const cur = curRef.current
      let moving = false
      for (let i = 0; i < cur.length; i++) {
        const d = (tgt[i] ?? 0) - cur[i]
        if (Math.abs(d) > 0.001) {
          cur[i] += d * 0.18 // tingkat kelenturan lerp
          moving = true
        } else {
          cur[i] = tgt[i] ?? 0
        }
      }
      setFactors([...cur])
      loopRef.current = moving ? requestAnimationFrame(step) : 0
    }
    loopRef.current = requestAnimationFrame(step)
  }

  const setTargetFromCursor = (clientX) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = clientX - rect.left
    
    // Hitung slot posisi awal untuk meredam feedback jitter
    const totalBase = count * collapsedWidth + (count - 1) * gap
    const startX = (rect.width - totalBase) / 2
    
    targetRef.current = Array(count).fill(0).map((_, i) => {
      const center = startX + i * (collapsedWidth + gap) + collapsedWidth / 2
      const dist = Math.abs(cx - center)
      const f = Math.max(0, 1 - dist / influence)
      return f * f * (3 - 2 * f) // kurva kehalusan smoothstep
    })
    startLoop()
  }

  const onMove = (e) => {
    if (open !== null) return
    setTargetFromCursor(e.clientX)
  }

  const onLeave = () => {
    if (open !== null) return
    targetRef.current = Array(count).fill(0)
    startLoop()
  }

  const close = () => {
    targetRef.current = Array(count).fill(0)
    curRef.current = Array(count).fill(0)
    setFactors(Array(count).fill(0))
    setClosing(true)
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setClosing(false), dur * 1000)
    setOpen(null)
  }

  const sizeFor = (i) => {
    if (open !== null) {
      return i === open
        ? { width: openSizeWidth, height: openSizeHeight }
        : { width: collapsedWidth, height: collapsedHeight }
    }
    const f = factors[i] ?? 0
    return {
      width: collapsedWidth + (hoverWidth - collapsedWidth) * f,
      height: collapsedHeight + (hoverHeight - collapsedHeight) * f,
    }
  }

  const { dur, ease } = parseTransition(transition)
  const openEase = `width ${dur}s ${ease}, height ${dur}s ${ease}, filter ${dur}s ${ease}, opacity ${dur}s ${ease}`
  const barTransition = open !== null || closing ? openEase : "none"

  return (
    <div
      ref={containerRef}
      style={{
        ...style,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap,
        position: "relative",
        overflow: "visible",
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Background transparan klik-tutup */}
      {open !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.15)",
            backdropFilter: "blur(2px)",
          }}
          onClick={close}
        />
      )}

      {images.map((img, i) => {
        const { width, height } = sizeFor(i)
        const blurred = open !== null && i !== open
        const isInfoCard = img.isInfo

        return (
          <div
            key={i}
            onClick={(e) => {
              e.stopPropagation()
              if (open === i) close()
              else setOpen(i)
            }}
            data-carousel-card
            className="shadow-xl transition-all duration-300 relative select-none cursor-pointer"
            style={{
              flex: "none",
              width,
              height,
              overflow: "hidden",
              cursor: "none",
              transition: barTransition,
              willChange: "width, height",
              zIndex: open === i ? 30 : 20,
              filter: blurred ? `blur(${blur}px)` : "none",
              opacity: blurred ? 0.35 : 1,
              backgroundColor: isInfoCard ? "#4A1620" : "#121212",
              backgroundImage: !isInfoCard && img.src ? `url(${img.src})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: img.bgPos || "center",
              backgroundRepeat: "no-repeat",
              border: "none",
              borderRadius: "0px",
            }}
          >
            {/* Info Card Content (Untuk bar paling kiri) */}
            {isInfoCard && (
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-cream h-full w-full box-border select-text">
                {open === i ? (
                  // State Terbuka (Detail penjelasan)
                  <div className="flex flex-col justify-between h-full w-full">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37] mb-1">
                        {img.role}
                      </p>
                      <h4 className="text-2xl md:text-3xl font-bold mb-4 font-sans tracking-tight">
                        {img.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-cream/80 max-w-lg mb-6 font-sans">
                        {img.description}
                      </p>

                      {/* Link ke website project (opsional) - hanya muncul kalau data punya field link */}
                      {img.link && (
                        <a
                          href={img.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          // stopPropagation: biar klik link tidak ikut menutup kartu / modal
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 mb-2 px-4 py-2 rounded-full border border-[#D4AF37] text-[#D4AF37] text-xs font-mono uppercase tracking-[0.2em] transition-colors duration-300 hover:bg-[#D4AF37] hover:text-[#4A1620]"
                          style={{ cursor: "none" }}
                        >
                          Visit Website
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17L17 7M8 7h9v9"/>
                          </svg>
                        </a>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37] mb-3">
                        Technologies Used
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {img.tech.map((t, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center gap-1.5 bg-cream/10 border border-cream/15 px-3 py-1.5 rounded-full text-xs font-medium font-mono"
                          >
                            <TechIcon name={t} />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // State Tertutup (Hanya Judul tegak atau teks padat)
                  <div className="flex flex-col justify-center items-center h-full w-full text-center">
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4AF37] rotate-90 whitespace-nowrap mb-16">
                      PROJECT INFO
                    </p>
                    <span className="font-extrabold text-sm md:text-base leading-tight uppercase tracking-wider block max-w-[80px]">
                      {img.title.split(" ")[0]}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
