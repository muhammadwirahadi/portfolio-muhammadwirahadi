import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Sparkles from '../hero/Sparkles'
import ScrollCue from '../hero/ScrollCue'
import Summary from './Summary'

gsap.registerPlugin(ScrollTrigger)

const STARS = [
  { id: '41-ari', cx: 625, cy: 370, radius: 3.2, label: '41 Arietis' },
  { id: 'hamal', cx: 765, cy: 440, radius: 5.4, label: 'Hamal' },
  { id: 'sheratan', cx: 925, cy: 530, radius: 3.8, label: 'Sheratan' },
  { id: 'mesarthim', cx: 965, cy: 605, radius: 3, label: 'Mesarthim' },
]

const LINES = [
  { from: { x: 625, y: 370 }, to: { x: 765, y: 440 } },
  { from: { x: 765, y: 440 }, to: { x: 925, y: 530 } },
  { from: { x: 925, y: 530 }, to: { x: 965, y: 605 } },
]

const SPARKLE_PATH =
  'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z'

// CATATAN ARSITEKTUR: dulu konten Summary dirender DI DALAM section yang di-pin,
// dengan container overflow-y-auto + instance Lenis kedua + handler wheel/touch
// manual untuk "mengoper" scroll ke halaman utama. Itu bikin dua sistem
// smooth-scroll berjalan bersamaan (tiap frame dua kali raf + dua kali
// ScrollTrigger.update), dan terasa berat saat scroll di Summary.
//
// Sekarang disamakan dengan Experiences & Contact: section pin ini CUMA berisi
// animasi zoom sinematiknya. Konten Summary dirender sebagai section terpisah
// SETELAHNYA (alur normal halaman), sehingga hanya ada SATU sistem scroll
// (Lenis global).
function SummarySpaceTransition({ active = false, onBack, setNavbarVisible, setLightTheme, setNavbarScrolled, setShowShootingStars, onNextJourney }) {
  const containerRef = useRef(null)
  const heroPanRef = useRef(null)
  const heroVisualsRef = useRef(null)
  const topOverlayRef = useRef(null)
  // Wrapper konten Summary sesungguhnya (di luar section pin)
  const summaryRef = useRef(null)

  const [sparklesActive, setSparklesActive] = useState(true)
  const [showScrollCue, setShowScrollCue] = useState(false)
  const [isSummaryActive, setIsSummaryActive] = useState(false)
  const scrollTriggerRef = useRef(null)

  useEffect(() => {
    if (!active) return

    let context
    const timer = setTimeout(() => {
      if (!heroVisualsRef.current || !heroPanRef.current || !topOverlayRef.current || !summaryRef.current) {
        return
      }

      context = gsap.context(() => {
        const containerRect = heroPanRef.current.getBoundingClientRect()
        const containerCenterX = containerRect.width / 2
        const containerCenterY = containerRect.height / 2

        // Bintang Hamal (Origin)
        const hamalGroup = heroVisualsRef.current.querySelector('[data-star-id="hamal"]')
        if (!hamalGroup) return
        const hamalIcon = hamalGroup.querySelector('[data-star-icon]')
        if (!hamalIcon) return
        const hamalRect = hamalIcon.getBoundingClientRect()
        const hamalX = hamalRect.left + hamalRect.width / 2 - containerRect.left
        const hamalY = hamalRect.top + hamalRect.height / 2 - containerRect.top
        const hamalDeltaX = containerCenterX - hamalX
        const hamalDeltaY = containerCenterY - hamalY

        // Bintang Sheratan (Target)
        const sheratanGroup = heroVisualsRef.current.querySelector('[data-star-id="sheratan"]')
        if (!sheratanGroup) return
        const sheratanIcon = sheratanGroup.querySelector('[data-star-icon]')
        if (!sheratanIcon) return
        const sheratanRect = sheratanIcon.getBoundingClientRect()
        const sheratanX = sheratanRect.left + sheratanRect.width / 2 - containerRect.left
        const sheratanY = sheratanRect.top + sheratanRect.height / 2 - containerRect.top

        const travelScale = 6.5

        // Panning offset sepanjang garis Hamal -> Sheratan
        const travelForwardX = containerCenterX - (hamalX + travelScale * (sheratanX - hamalX))
        const travelForwardY = containerCenterY - (hamalY + travelScale * (sheratanY - hamalY))

        // Panning offset akhir pada zoom-in maksimal ke Sheratan (skala 330)
        const finalSheratanX = containerCenterX - (hamalX + 330 * (sheratanX - hamalX))
        const finalSheratanY = containerCenterY - (hamalY + 330 * (sheratanY - hamalY))

        // Setup Posisi Awal (Terkunci pada Hamal)
        gsap.set(heroVisualsRef.current, {
          scale: 330,
          transformOrigin: `${hamalX}px ${hamalY}px`,
        })
        gsap.set(heroPanRef.current, {
          x: hamalDeltaX,
          y: hamalDeltaY,
        })
        gsap.set(topOverlayRef.current, { opacity: 1 })
        gsap.set(summaryRef.current, { opacity: 0 })

        // Garis neon penghubung (Hamal -> Sheratan) - panjang 184px (dasharray 200/dashoffset 200)
        gsap.set('.glow-path-line-summary', { strokeDashoffset: 200 })

        // Buat ScrollTrigger Timeline - HANYA untuk animasi zoom sinematiknya.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=300%',
            scrub: 1,
            pin: true,
            pinSpacing: true,
            onUpdate: (self) => {
              scrollTriggerRef.current = self

              // Tampilkan navbar pada awal (saat meninggalkan Experiences) dan akhir (Summary)
              if (self.progress <= 0.05) {
                setNavbarVisible?.(true)
              } else if (self.progress >= 0.90) {
                // Navbar visible diatur sinkron oleh Summary.jsx
              } else {
                setNavbarVisible?.(false)
              }

              // Tema warna navbar
              if (self.progress <= 0.05 || self.progress >= 0.85) {
                setLightTheme?.(true)
              } else {
                setLightTheme?.(false)
              }

              // Pemicu shooting stars
              setShowShootingStars?.(self.progress <= 0.05)

              // Sparkles active
              setSparklesActive(self.progress < 0.90)

              // Scroll cue & scrolled navbar state. Begitu pin dilepas, perubahan
              // ini diambil alih ScrollTrigger milik konten Summary (lihat di bawah).
              if (self.progress >= 0.90) {
                setNavbarScrolled?.(false)
                setShowScrollCue?.(true)
              } else {
                setNavbarScrolled?.(true)
                setShowScrollCue?.(false)
              }
            },
            onLeave: () => {
              // Pin baru BENERAN lepas di sini - konten Summary (di bawahnya,
              // alur normal) sudah persis di posisi teratas layar. Baru di
              // titik ini animasi masuknya boleh jalan.
              setIsSummaryActive(true)
              gsap.to(summaryRef.current, {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out',
              })
            },
            onEnterBack: () => {
              // Scroll balik ke atas (masuk lagi ke area pin) - reset supaya
              // animasi masuk Summary bisa terulang lagi nanti.
              setIsSummaryActive(false)
              gsap.set(summaryRef.current, { opacity: 0 })
            },
            onLeaveBack: () => {
              setIsSummaryActive(false)
              setNavbarVisible?.(true)
              setLightTheme?.(true)
              setShowShootingStars?.(true)
              setSparklesActive(true)
              setNavbarScrolled?.(true)
              setShowScrollCue?.(false)
              onBack?.() // Mundur ke Experiences page
            }
          }
        })

        // STAGE 1: Zoom out & memudarkan top overlay krem
        tl.to(topOverlayRef.current, {
          opacity: 0,
          ease: 'power1.inOut',
          duration: 0.25,
        }, 0)
        .fromTo(heroVisualsRef.current, {
          scale: 330,
        }, {
          scale: travelScale,
          ease: 'power2.out',
          duration: 0.25,
        }, 0)

        // STAGE 2: Panning kamera ke Sheratan & gambar garis neon
        .fromTo('.glow-path-line-summary', {
          strokeDashoffset: 200,
        }, {
          strokeDashoffset: 0,
          ease: 'power1.inOut',
          duration: 0.35,
        }, 0.25)
        .fromTo(heroPanRef.current, {
          x: hamalDeltaX,
          y: hamalDeltaY,
        }, {
          x: travelForwardX,
          y: travelForwardY,
          ease: 'power2.inOut',
          duration: 0.35,
        }, 0.25)

        // STAGE 3: Zoom-in tajam ke Sheratan. Munculnya konten Summary TIDAK
        // lagi lewat scrub di sini - itu jalan lewat onLeave di atas.
        .fromTo(heroVisualsRef.current, {
          scale: travelScale,
        }, {
          scale: 330,
          ease: 'power2.inOut',
          duration: 0.40,
        }, 0.60)
        .fromTo(heroPanRef.current, {
          x: travelForwardX,
          y: travelForwardY,
        }, {
          x: finalSheratanX,
          y: finalSheratanY,
          ease: 'power2.inOut',
          duration: 0.40,
        }, 0.60)

        ScrollTrigger.refresh()
      }, containerRef)
    }, 50)

    return () => {
      clearTimeout(timer)
      if (context) context.revert()
    }
  }, [active])

  // Toggle navbar "scrolled" & ScrollCue berdasarkan posisi scroll WINDOW
  // relatif ke konten Summary (sama seperti pola di Experiences).
  useEffect(() => {
    if (!isSummaryActive) return

    const trigger = ScrollTrigger.create({
      trigger: summaryRef.current,
      start: 'top+=15 top',
      onEnter: () => {
        setNavbarScrolled?.(true)
        setShowScrollCue?.(false)
      },
      onLeaveBack: () => {
        setNavbarScrolled?.(false)
        setShowScrollCue?.(true)
      },
    })

    return () => trigger.kill()
  }, [isSummaryActive, setNavbarScrolled])

  return (
    <>
      <section
        ref={containerRef}
        id="summary"
        className="relative z-30 h-screen w-screen overflow-hidden bg-maroon -mt-px"
      >
        {/* Sengaja pakai vh (bukan svh): section ini harus menutup SELURUH layar
            HP, termasuk area yang ditempati address bar saat menciut. Kalau
            lebih pendek, strip di bawahnya memperlihatkan latar krem di belakang. */}
        <style>{`
          #summary {
            top: -2px !important;
            height: calc(100vh + 4px) !important;
          }
        `}</style>
        {/* Background Sparkles Particles */}
        <Sparkles className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-60" active={sparklesActive} />

        {/* Peta Rasi Bintang */}
        <div ref={heroPanRef} className="absolute -top-px left-0 w-full h-[calc(100%+2px)] pointer-events-none z-10">
          <div ref={heroVisualsRef} className="absolute inset-0 h-full w-full">
            <svg
              viewBox="0 0 1600 900"
              className="h-full w-full"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <radialGradient id="transStarGlowScrollSummary" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F8F1DC" stopOpacity="0.85" />
                  <stop offset="35%" stopColor="#D4AF37" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Rasi Bintang Aries Lines */}
              {LINES.map((line, idx) => (
                <line
                  key={idx}
                  x1={line.from.x}
                  y1={line.from.y}
                  x2={line.to.x}
                  y2={line.to.y}
                  stroke="#D4AF37"
                  strokeWidth="1.4"
                  strokeOpacity="0.4"
                  strokeLinecap="round"
                />
              ))}

              {/* Neon Draw Line (Hamal <-> Sheratan) - panjang 184px (dasharray 200/dashoffset 200) */}
              <line
                className="glow-path-line-summary"
                x1="765"
                y1="440"
                x2="925"
                y2="530"
                stroke="#D4AF37"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray="200"
                strokeDashoffset="200"
              />

              {/* Bintang-bintang Rasi */}
              {STARS.map((star) => {
                const isSheratan = star.id === 'sheratan'
                const size = star.radius * (isSheratan ? 6.5 : 5)
                const scale = size / 24
                return (
                  <g key={star.id} data-star-id={star.id}>
                    {/* Halo Glow */}
                    <circle
                      cx={star.cx}
                      cy={star.cy}
                      r={star.radius * 6.5}
                      fill="url(#transStarGlowScrollSummary)"
                    />

                    {/* Teks Label Bintang */}
                    <g className="pointer-events-none">
                      <text
                        x={star.cx}
                        y={star.cy - (size / 2 + 16)}
                        textAnchor="middle"
                        fontFamily="Archivo, sans-serif"
                        fontSize="14"
                        fontWeight="600"
                        letterSpacing="0.4"
                        stroke="#4A1620"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        fill="none"
                      >
                        {star.label}
                      </text>
                      <text
                        x={star.cx}
                        y={star.cy - (size / 2 + 16)}
                        textAnchor="middle"
                        fontFamily="Archivo, sans-serif"
                        fontSize="14"
                        fontWeight="600"
                        letterSpacing="0.4"
                        fill="#F8F1DC"
                      >
                        {star.label}
                      </text>
                    </g>

                    {/* Sparkle Icon (Matches Experiences/About star icon shapes) */}
                    <g transform={`translate(${star.cx}, ${star.cy})`} data-star-icon>
                      <path
                        d={SPARKLE_PATH}
                        fill={isSheratan ? '#F8F1DC' : '#F0E4C8'}
                        transform={`scale(${scale}) translate(-12, -12)`}
                      />
                    </g>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Top Cream Color Transition Overlay */}
        <div
          ref={topOverlayRef}
          className="pointer-events-none absolute inset-0 z-20 bg-cream"
        />
      </section>

      {/* Konten Summary sesungguhnya - ALUR NORMAL halaman, mengikuti scroll
          utama (bukan lagi di dalam container yang di-pin). */}
      <div ref={summaryRef} id="summary-content" className="relative z-30 opacity-0 -mt-[100vh]">
        <Summary
          active={isSummaryActive}
          setNavbarVisible={setNavbarVisible}
          onNextJourney={onNextJourney}
        />

        {/* Petunjuk scroll di dasar layar pertama Summary */}
        <div className="pointer-events-none absolute left-0 top-0 h-svh w-full">
          <ScrollCue visible={showScrollCue} light={true} disableScrollTrigger={true} />
        </div>
      </div>
    </>
  )
}

export default SummarySpaceTransition
