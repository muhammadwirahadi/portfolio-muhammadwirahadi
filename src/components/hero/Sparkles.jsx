import { useEffect, useRef } from 'react'

// Stardust - background partikel kecil yang flicker (berkedip) & drift
// (bergeser) pelan lewat canvas 2D. Menggantikan pendekatan titik SVG statis
// sebelumnya untuk bintang dekorasi latar - lebih halus & terasa hidup,
// tanpa perlu daftar posisi manual.

function parseColorToRgba(input) {
  if (!input) return { r: 0, g: 0, b: 0, a: 1 }
  const str = input.trim().toLowerCase()
  if (str === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }

  const rgbaMatch = str.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i
  )
  if (rgbaMatch) {
    const r = Math.max(0, Math.min(255, parseFloat(rgbaMatch[1]))) / 255
    const g = Math.max(0, Math.min(255, parseFloat(rgbaMatch[2]))) / 255
    const b = Math.max(0, Math.min(255, parseFloat(rgbaMatch[3]))) / 255
    const a =
      rgbaMatch[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(rgbaMatch[4]))) : 1
    return { r, g, b, a }
  }

  const hex = str.replace(/^#/, '')
  if (hex.length === 8) {
    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      a: parseInt(hex.slice(6, 8), 16) / 255,
    }
  }
  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      a: 1,
    }
  }
  if (hex.length === 4) {
    return {
      r: parseInt(hex[0] + hex[0], 16) / 255,
      g: parseInt(hex[1] + hex[1], 16) / 255,
      b: parseInt(hex[2] + hex[2], 16) / 255,
      a: parseInt(hex[3] + hex[3], 16) / 255,
    }
  }
  if (hex.length === 3) {
    return {
      r: parseInt(hex[0] + hex[0], 16) / 255,
      g: parseInt(hex[1] + hex[1], 16) / 255,
      b: parseInt(hex[2] + hex[2], 16) / 255,
      a: 1,
    }
  }
  return { r: 0, g: 0, b: 0, a: 1 }
}

function rgbaToCanvasColor(rgba) {
  const r = Math.round(rgba.r * 255)
  const g = Math.round(rgba.g * 255)
  const b = Math.round(rgba.b * 255)
  if (rgba.a === 1) return `rgb(${r}, ${g}, ${b})`
  return `rgba(${r}, ${g}, ${b}, ${rgba.a})`
}

// Default disesuaikan ke palette Wira (gold/cream) dan dibuat cukup jarang
// (density rendah) supaya tetap terasa halus, bukan "rame"/noise penuh layar.
const DEFAULTS = {
  background: 'transparent',
  particleColor: '#F0E4C8',
  particleDensity: 1,
  minSize: 0.5,
  maxSize: 1.6,
  speed: 2,
  particleSpeed: 1,
  movement: 1,
  angle: 64,
}

// --- Pengaturan performa ---
// Partikelnya cuma titik 1-3px yang berkedip pelan, jadi tidak perlu sepadat
// & sehalus aslinya. Semua angka di bawah menurunkan beban tanpa mengubah
// kesan "debu bintang" secara berarti.
const DENSITY_SCALE = 0.5 // pengali jumlah partikel dari hasil density
const MAX_PARTICLES = 650 // batas atas (layar besar / 4K)
const MAX_DPR = 1.5 // resolusi backing store maksimal (titik kecil tak butuh 2x-3x)
const TARGET_FPS = 30 // gerak & kedip lambat, 30fps sudah mulus

// UI 1..10 -> internal 0.5..12 (kecepatan flicker)
function mapFlickerUiToInternal(ui) {
  const clamped = Math.max(1, Math.min(10, ui))
  const t = (clamped - 1) / 9
  return 0.5 + t * 11.5
}

// UI 1..10 -> internal 5..60 (kepadatan partikel)
function mapDensityUiToInternal(ui) {
  const clamped = Math.max(1, Math.min(10, ui))
  const t = (clamped - 1) / 9
  return 5 + t * 55
}

// Sudut (derajat) -> vektor arah drift. 0deg = atas, 90deg = kanan, dst
// (searah jarum jam dari atas).
function angleToDrift(angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { vx: Math.cos(rad), vy: Math.sin(rad) }
}

function Sparkles({
  background = DEFAULTS.background,
  particleColor = DEFAULTS.particleColor,
  particleDensity = DEFAULTS.particleDensity,
  minSize = DEFAULTS.minSize,
  maxSize = DEFAULTS.maxSize,
  speed = DEFAULTS.speed,
  particleSpeed = DEFAULTS.particleSpeed,
  movement = DEFAULTS.movement,
  angle = DEFAULTS.angle,
  className = '',
  active = true,
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const particlesRef = useRef([])
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Hentikan perhitungan & bersihkan kanvas jika tidak sedang aktif
    if (!active) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    const initParticles = (width, height) => {
      const particles = []
      const area = width * height
      const mappedDensity = mapDensityUiToInternal(particleDensity)
      const count = Math.min(
        MAX_PARTICLES,
        Math.floor((area / 1e4) * mappedDensity * DENSITY_SCALE)
      )
      const velocityMultiplier = (particleSpeed / 10) * 0.5

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * velocityMultiplier,
          vy: (Math.random() - 0.5) * velocityMultiplier,
          size: minSize + Math.random() * (maxSize - minSize),
          opacity: Math.random(),
          opacityVel: (Math.random() - 0.5) * 0.04,
        })
      }
      particlesRef.current = particles
    }

    // Ukuran area gambar (CSS px), diisi oleh resize() dan dipakai loop animasi
    let viewWidth = 1
    let viewHeight = 1
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      viewWidth = container.clientWidth || container.offsetWidth || 1
      viewHeight = container.clientHeight || container.offsetHeight || 1
      canvas.width = Math.round(viewWidth * dpr)
      canvas.height = Math.round(viewHeight * dpr)
      canvas.style.width = `${viewWidth}px`
      canvas.style.height = `${viewHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initParticles(viewWidth, viewHeight)
    }
    resize()

    const mappedSpeed = mapFlickerUiToInternal(speed)
    const driftMag = movement * 0.1
    const { vx: driftDirX, vy: driftDirY } = angleToDrift(angle)
    const driftVx = driftDirX * driftMag
    const driftVy = driftDirY * driftMag

    const backgroundRgba = parseColorToRgba(background)
    const backgroundColor = rgbaToCanvasColor(backgroundRgba)
    const particleColorRgba = parseColorToRgba(particleColor)
    const particleColorBase = rgbaToCanvasColor({ ...particleColorRgba, a: 1 })

    // Titik bulat digambar SEKALI ke kanvas kecil (sprite), lalu tiap partikel
    // cukup di-drawImage dengan ukuran & opacity masing-masing. Jauh lebih murah
    // daripada beginPath + arc + fill untuk setiap partikel di setiap frame.
    const SPRITE_PX = 16
    const sprite = document.createElement('canvas')
    sprite.width = SPRITE_PX
    sprite.height = SPRITE_PX
    const spriteCtx = sprite.getContext('2d')
    spriteCtx.fillStyle = particleColorBase
    spriteCtx.beginPath()
    spriteCtx.arc(SPRITE_PX / 2, SPRITE_PX / 2, SPRITE_PX / 2, 0, Math.PI * 2)
    spriteCtx.fill()

    const drawParticles = () => {
      ctx.clearRect(0, 0, viewWidth, viewHeight)
      // Background default-nya transparan: tidak perlu mengisi apa-apa
      if (backgroundRgba.a > 0) {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, viewWidth, viewHeight)
      }
      for (const particle of particlesRef.current) {
        ctx.globalAlpha = particleColorRgba.a * particle.opacity
        const diameter = particle.size * 2
        ctx.drawImage(
          sprite,
          particle.x - particle.size,
          particle.y - particle.size,
          diameter,
          diameter
        )
      }
      ctx.globalAlpha = 1
    }

    // --- Loop animasi ---
    // isVisible: dari IntersectionObserver. Kanvas di luar layar (misal section
    // yang belum dicapai, atau sudah dilewati) berhenti total, bukan sekadar
    // menggambar sesuatu yang tidak terlihat.
    let isRunning = false
    let isVisible = true
    let lastFrameTime = 0
    const frameInterval = 1000 / TARGET_FPS

    const animate = (now) => {
      if (!isVisible) {
        isRunning = false
        animationRef.current = null
        return
      }
      animationRef.current = requestAnimationFrame(animate)

      // Batasi ke TARGET_FPS (monitor 120/144Hz tidak perlu menggambar ulang
      // titik-titik pelan ini sebanyak itu)
      const elapsed = now - lastFrameTime
      if (elapsed < frameInterval - 1) return
      lastFrameTime = now

      // Skala langkah gerak terhadap 60fps supaya kecepatan drift & kedip tetap
      // sama walau frame-nya lebih jarang. Dibatasi agar tidak "loncat" setelah
      // tab/section lama tidak terlihat.
      const step = Math.min(elapsed, 100) / (1000 / 60)

      for (const particle of particlesRef.current) {
        particle.x += (particle.vx + driftVx) * step
        particle.y += (particle.vy + driftVy) * step
        if (particle.x < 0) particle.x = viewWidth
        if (particle.x > viewWidth) particle.x = 0
        if (particle.y < 0) particle.y = viewHeight
        if (particle.y > viewHeight) particle.y = 0

        particle.opacity += particle.opacityVel * mappedSpeed * 0.5 * step
        if (particle.opacity <= 0.1 || particle.opacity >= 1) {
          particle.opacityVel *= -1
        }
        particle.opacity = Math.max(0.1, Math.min(1, particle.opacity))
      }

      drawParticles()
    }

    const start = () => {
      if (isRunning || !isVisible) return
      isRunning = true
      // Mundurkan 1 interval supaya frame pertama langsung digambar
      lastFrameTime = performance.now() - frameInterval
      animationRef.current = requestAnimationFrame(animate)
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting
        if (isVisible) start()
      },
      { threshold: 0 }
    )
    intersectionObserver.observe(container)

    // Mengubah ukuran canvas mengosongkan isinya, jadi gambar ulang segera
    const handleResize = () => {
      resize()
      drawParticles()
    }
    window.addEventListener('resize', handleResize)

    start()

    return () => {
      isVisible = false
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      animationRef.current = null
      intersectionObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [
    background,
    particleColor,
    particleDensity,
    minSize,
    maxSize,
    speed,
    particleSpeed,
    movement,
    angle,
    active,
  ])

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none h-full w-full overflow-hidden ${className || 'relative'}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  )
}

export default Sparkles
