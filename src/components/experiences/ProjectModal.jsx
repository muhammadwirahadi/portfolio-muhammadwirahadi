import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import MagneticCarousel from './MagneticCarousel'

// Tinggi area carousel di dalam modal. Di HP, ruang yang dipakai elemen lain
// sedikit lebih kecil (padding atas lebih tipis) tapi batas minimumnya juga
// lebih rendah supaya tetap muat di layar pendek (mis. iPhone SE).
function computeCarouselHeight() {
  const isPhone = window.innerWidth < 768
  const reserved = isPhone ? 290 : 300
  const minHeight = isPhone ? 240 : 300
  return Math.max(minHeight, Math.min(460, window.innerHeight - reserved))
}

// Modal detail project. Alur animasi masuk (dibuat berurutan supaya terasa
// "terungkap", bukan muncul tiba-tiba):
//   1. Layar krem mekar melingkar dari titik yang diklik user
//   2. Judul project naik dari balik mask, garis pembatas menggambar
//   3. Kartu-kartu foto muncul bergiliran (stagger) dari bawah
//   4. Tombol tutup & petunjuk fade in terakhir
// Saat ditutup, urutannya dibalik singkat: konten memudar, lingkaran menyusut
// kembali ke titik klik.
function ProjectModal({ project, origin, onClose }) {
  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  const isClosingRef = useRef(false)

  // Tinggi area carousel menyesuaikan tinggi layar supaya seluruh isi modal
  // (header, carousel, petunjuk di bawah) selalu muat dalam 1 layar tanpa scroll.
  // 300px = perkiraan total tinggi elemen lain (padding atas untuk navbar,
  // header, petunjuk, padding bawah). Dibatasi 300-460px.
  const [carouselHeight, setCarouselHeight] = useState(computeCarouselHeight)

  // Mode kompak (HP/tablet): carousel berupa kartu yang digeser. Batasnya sama
  // dengan COMPACT_BREAKPOINT di MagneticCarousel (lebar area carousel < 900px,
  // yaitu lebar layar dikurangi padding 48px).
  const [isCompact, setIsCompact] = useState(() => window.innerWidth - 48 < 900)

  useEffect(() => {
    const handleResize = () => {
      setCarouselHeight(computeCarouselHeight())
      setIsCompact(window.innerWidth - 48 < 900)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Kunci scroll halaman di belakang modal. Di HP, tanpa ini menggeser jari di
  // modal ikut menggulir halaman di baliknya.
  useEffect(() => {
    const lenis = window.globalLenis
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
      lenis?.start()
    }
  }, [])

  // Titik pusat lingkaran: posisi klik user, fallback ke tengah layar
  // (misal modal dibuka lewat keyboard, tanpa koordinat mouse).
  const getOriginPoint = () => ({
    x: origin?.x ?? window.innerWidth / 2,
    y: origin?.y ?? window.innerHeight / 2,
  })

  // Jari-jari lingkaran yang cukup besar untuk menutup seluruh layar dari titik asal
  const getMaxRadius = ({ x, y }) =>
    Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

  // useLayoutEffect (bukan useEffect) supaya state awal animasi sudah terpasang
  // SEBELUM browser nge-paint - kalau tidak, konten sempat berkedip penuh dulu.
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const overlay = overlayRef.current
    const point = getOriginPoint()

    const context = gsap.context(() => {
      // Kartu carousel ditandai data-carousel-card di MagneticCarousel.jsx
      const cards = overlay.querySelectorAll('[data-carousel-card]')

      // State awal: semua tersembunyi
      gsap.set(overlay, { clipPath: `circle(0px at ${point.x}px ${point.y}px)` })
      gsap.set('.pm-title-inner', { yPercent: 110 })
      gsap.set('.pm-role', { opacity: 0, y: 10 })
      gsap.set('.pm-line', { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(cards, { y: 70, opacity: 0, scale: 0.85 })
      gsap.set('.pm-fade-last', { opacity: 0 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // 1. Lingkaran krem mekar dari titik klik
      tl.to(overlay, {
        clipPath: `circle(${getMaxRadius(point)}px at ${point.x}px ${point.y}px)`,
        duration: 0.9,
        ease: 'power3.inOut',
        // Lepas clip-path setelah selesai supaya tidak membatasi elemen yang
        // sengaja meluap (kartu carousel yang membesar saat dibuka)
        onComplete: () => gsap.set(overlay, { clearProps: 'clipPath' }),
      })
        // 2. Judul naik dari balik mask + role + garis menggambar
        .to('.pm-title-inner', { yPercent: 0, duration: 0.7 }, '-=0.4')
        .to('.pm-role', { opacity: 1, y: 0, duration: 0.5 }, '-=0.5')
        .to('.pm-line', { scaleX: 1, duration: 0.6, ease: 'power2.inOut' }, '-=0.45')
        // 3. Foto-foto muncul bergiliran dari bawah
        .to(
          cards,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.09,
            ease: 'back.out(1.3)',
            // Kembalikan kontrol transform/opacity ke MagneticCarousel
            // (ia mengatur opacity sendiri saat kartu dibuka/blur)
            clearProps: 'transform,opacity',
          },
          '-=0.3'
        )
        // 4. Tombol tutup & petunjuk
        .to('.pm-fade-last', { opacity: 1, duration: 0.5 }, '-=0.2')
    }, overlay)

    return () => context.revert()
    // Hanya jalan sekali saat modal mount - origin tidak berubah selama modal terbuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClose = () => {
    if (isClosingRef.current) return
    isClosingRef.current = true

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      onClose()
      return
    }

    const overlay = overlayRef.current
    const point = getOriginPoint()

    gsap
      .timeline({ onComplete: onClose })
      .to(contentRef.current, { opacity: 0, y: 24, duration: 0.3, ease: 'power2.in' })
      .set(overlay, { clipPath: `circle(${getMaxRadius(point)}px at ${point.x}px ${point.y}px)` })
      .to(
        overlay,
        {
          clipPath: `circle(0px at ${point.x}px ${point.y}px)`,
          duration: 0.6,
          ease: 'power3.inOut',
        },
        '-=0.05'
      )
  }

  return (
    <div
      ref={overlayRef}
      // pt-28: sisakan ruang untuk navbar (logo & hamburger tetap tampil di atas modal).
      // Tidak ada scroll: tinggi carousel yang menyesuaikan layar (lihat carouselHeight).
      className="fixed inset-0 bg-[#F8F1DC]/97 z-[999] backdrop-blur-md flex flex-col items-center justify-center overflow-hidden overscroll-contain px-4 sm:px-6 pt-24 md:pt-28 pb-4 md:pb-6"
      onClick={handleClose}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div ref={contentRef} className="w-full max-w-6xl flex flex-col items-center">
        {/* Header: judul project (mask reveal) + role + garis pembatas */}
        {/* px-12 di mobile: sisakan ruang di kanan supaya judul tidak menabrak tombol tutup */}
        <div className="w-full max-w-4xl mb-5 md:mb-6 px-12 md:px-0 text-center" onClick={(e) => e.stopPropagation()}>
          <p className="pm-role text-xs font-mono uppercase tracking-[0.25em] text-[#4A1620]/60 mb-2">
            {project.role}
          </p>
          <div className="overflow-hidden">
            <h3 className="pm-title-inner text-xl sm:text-2xl md:text-4xl font-bold tracking-tight text-[#4A1620] font-sans leading-tight pb-1">
              {project.title}
            </h3>
          </div>
          <div className="pm-line mt-4 h-0.5 w-full bg-[#4A1620]/25" />
        </div>

        {/* Container Magnetic Carousel */}
        <div
          className="w-full max-w-6xl flex items-center justify-center"
          style={{ height: carouselHeight }}
          onClick={(e) => e.stopPropagation()}
        >
          <MagneticCarousel
            images={project.carouselImages}
            openSizeWidth={750}
            openSizeHeight={Math.min(420, carouselHeight - 20)}
          />
        </div>

        {/* Instruksi Pengguna */}
        <div className="pm-fade-last">
          <p className="mt-3 md:mt-4 px-4 text-center text-[10px] md:text-xs font-mono uppercase tracking-[0.15em] md:tracking-[0.2em] text-[#4A1620]/60 select-none animate-pulse">
            {isCompact
              ? 'Swipe to browse • Tap × to close'
              : 'Click cards to expand/collapse • Click outside or button to close'}
          </p>
        </div>
      </div>

      {/* Tombol Tutup Silang di Kanan Atas (sejajar dengan batas konten/hamburger menu) */}
      <div className="pm-fade-last absolute top-[5.5rem] md:top-28 left-0 right-0 max-w-6xl w-full mx-auto px-4 sm:px-6 pointer-events-none z-50">
        <motion.div
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          role="button"
          className="absolute right-4 sm:right-6 top-0 text-[#4A1620] cursor-pointer font-bold text-2xl flex items-center justify-center h-11 w-11 md:h-12 md:w-12 border border-[#4A1620]/25 rounded-full select-none pointer-events-auto"
          style={{ zIndex: 10000, cursor: 'none' }}
          whileHover={{
            scale: 1.1,
            rotate: 90,
            backgroundColor: '#4A1620',
            borderColor: '#4A1620',
            color: '#F8F1DC',
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          &times;
        </motion.div>
      </div>
    </div>
  )
}

export default ProjectModal
