import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import NextJourneySummary from './NextJourneySummary'

// Icon tech stack - dicocokkan sama stack ASLI yang dipakai di project
// Badilag, LSF & DMDI (lihat Experiences.jsx), bukan daftar generik. Warna
// direcolor maroon lewat Simple Icons CDN, konsisten sama section Skills.
const SUMMARY_STACK = [
  { slug: 'php', label: 'PHP' },
  { slug: 'laravel', label: 'Laravel' },
  { slug: 'vuedotjs', label: 'Vue.js' },
  { slug: 'tailwindcss', label: 'Tailwind CSS' },
  { slug: 'mysql', label: 'MySQL' },
  { slug: 'git', label: 'Git' },
  { slug: 'github', label: 'GitHub' },
  // Tambahan dari project Dewan Masjid Digital Indonesia (Next.js)
  { slug: 'javascript', label: 'JavaScript' },
  { slug: 'nextdotjs', label: 'Next.js' },
  { slug: 'prisma', label: 'Prisma' },
  { slug: 'postgresql', label: 'PostgreSQL' },
  { slug: 'nginx', label: 'Nginx' },
  { slug: 'githubactions', label: 'GitHub Actions' },
]

const STATS = [
  { value: '6', label: 'Months Experience' },
  { value: '2', label: 'Internships Completed' },
  { value: '3', label: 'Major Projects Shipped' },
]

function Summary({ active = false, setNavbarVisible, scrollerRef, onNextJourney }) {
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const lineRef = useRef(null)
  const contentRef = useRef(null)
  const ctaRef = useRef(null)
  const arrowRef = useRef(null)
  const [startSummaryAnim, setStartSummaryAnim] = useState(false)

  // 1. Entrance animation for Summary Title & Content
  useEffect(() => {
    if (!active) {
      if (titleRef.current) gsap.set(titleRef.current, { opacity: 0, y: 30 })
      if (lineRef.current) gsap.set(lineRef.current, { scaleX: 0 })
      if (contentRef.current) gsap.set(contentRef.current, { opacity: 0, y: 30 })
      setStartSummaryAnim(false)
      return
    }

    gsap.set(titleRef.current, { opacity: 0, y: 30 })
    gsap.set(contentRef.current, { opacity: 0, y: 30 })

    const tl = gsap.timeline({ delay: 0.1 })

    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    })
      .to(lineRef.current, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.5')
      .to(
        contentRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          onComplete: () => {
            setStartSummaryAnim(true)
            setNavbarVisible?.(true)
          },
        },
        '-=0.4'
      )
  }, [active, setNavbarVisible])

  // Micro-interaction tombol Download CV - panah "meluncur" turun sedikit
  // lalu balik ke atas pas hover, bukan cuma ganti warna doang.
  const handleCtaEnter = () => {
    gsap.to(arrowRef.current, { y: 4, duration: 0.25, ease: 'power2.out' })
  }
  const handleCtaLeave = () => {
    gsap.to(arrowRef.current, { y: 0, duration: 0.3, ease: 'power2.out' })
  }

  return (
    <div ref={containerRef} className="w-full bg-cream text-[#4A1620] relative overflow-x-hidden">
      {/* Halaman 1: Summary Content (min-h-screen, diringkas biar muat 1 layar) */}
      <div className="min-h-svh flex flex-col justify-center relative w-full py-24 md:py-20">
        {/* Header Section */}
        <div className="max-w-6xl w-full mx-auto px-6 relative">
          <div ref={titleRef} className="opacity-0">
            <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wider text-[#4A1620]">
              Summary
            </h2>
          </div>
          <span
            ref={lineRef}
            className="block h-[1px] w-full bg-[#4A1620]/25 mt-4 origin-left scale-x-0"
          />
        </div>

        {/* Content Section */}
        <div
          ref={contentRef}
          className="max-w-6xl w-full mx-auto px-6 mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 opacity-0"
        >
          {/* Kolom kiri: narasi ringkas + CTA Download CV */}
          <div className="md:col-span-7 flex flex-col gap-8">
            <p className="text-base sm:text-lg md:text-xl text-left sm:text-justify font-light leading-relaxed text-[#4A1620] tracking-wide">
              Full Stack Developer berbasis di Jakarta, lulusan Informatika
              Universitas Bina Sarana Informatika. Enam bulan pengalaman
              hands-on membangun sistem pendaftaran magang untuk instansi
              pemerintah dari backend di Badan Peradilan Agama sampai full stack di
              Lembaga Sensor Film RI, ditambah proyek freelance CMS khutbah
              multibahasa untuk Dewan Masjid Digital Indonesia.
            </p>

            {/* Strip statistik ringkas - kesan "kena" tanpa perlu baca panjang */}
            <div className="flex flex-wrap gap-x-8 gap-y-5">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-bold text-[#4A1620]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#4A1620]/60">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Tombol Download CV */}
            <a
              ref={ctaRef}
              // BASE_URL = base di vite.config.js ('/portfolio-muhammadwirahadi/').
              // Jangan tulis '/cv-...pdf' langsung: itu menunjuk ke root domain, bukan
              // ke subpath GitHub Pages, jadi file-nya tidak ketemu (404).
              href={`${import.meta.env.BASE_URL}cv-muhammad-wira-hadi.pdf`}
              download="cv-muhammad-wira-hadi.pdf"
              onMouseEnter={handleCtaEnter}
              onMouseLeave={handleCtaLeave}
              className="group inline-flex w-fit items-center gap-3 rounded-full bg-[#4A1620] px-7 py-3.5 text-sm uppercase tracking-[0.2em] text-[#F0E4C8] transition-colors duration-300 hover:bg-[#D4AF37] hover:text-[#4A1620] active:bg-[#D4AF37] active:text-[#4A1620]"
            >
              Download CV
              <svg
                ref={arrowRef}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>

          {/* Kolom kanan: Education, Skills, Key Accomplishments - dipadatkan */}
          <div className="md:col-span-5 flex flex-col gap-7">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#4A1620]/60 mb-2">
                Education
              </h3>
              <p className="font-display text-base font-semibold text-[#4A1620]">
                Universitas Bina Sarana Informatika
              </p>
              <p className="text-xs text-[#4A1620]/70 mt-0.5">
                Bachelor&apos;s Degree, Informatics • Jakarta
              </p>
            </div>

            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#4A1620]/60 mb-2">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {SUMMARY_STACK.map((tech) => (
                  <div
                    key={tech.slug}
                    title={tech.label}
                    className="group relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#4A1620]/15 bg-[#4A1620]/5 transition-colors duration-300 hover:border-[#4A1620]/30"
                  >
                    {/* Versi maroon (default) - fade out pas di-hover */}
                    <img
                      src={`https://cdn.simpleicons.org/${tech.slug}/4A1620`}
                      alt={tech.label}
                      className="h-4.5 w-4.5 transition-opacity duration-300 group-hover:opacity-0"
                    />
                    {/* Versi warna asli brand - fade in pas di-hover, numpuk persis di posisi yang sama */}
                    <img
                      src={`https://cdn.simpleicons.org/${tech.slug}`}
                      alt=""
                      aria-hidden="true"
                      className="absolute h-4.5 w-4.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#4A1620]/60 mb-2">
                Key Accomplishments
              </h3>
              <div className="flex flex-col gap-3">
                <div className="border-l-2 border-[#4A1620]/20 pl-4 py-0.5">
                  <h4 className="font-bold text-sm">Dewan Masjid Digital Indonesia • Backend Developer</h4>
                  <p className="text-xs text-[#4A1620]/75 mt-0.5">
                    CMS khutbah Jumat ~12 bahasa dengan panel admin custom,
                    autentikasi JWT, dan deployment otomatis ke VPS.
                  </p>
                </div>
                <div className="border-l-2 border-[#4A1620]/20 pl-4 py-0.5">
                  <h4 className="font-bold text-sm">Lembaga Sensor Film RI • Fullstack Developer</h4>
                  <p className="text-xs text-[#4A1620]/75 mt-0.5">
                    Sistem pendaftaran magang & logbook harian terintegrasi
                    untuk Lembaga Sensor Film RI.
                  </p>
                </div>
                <div className="border-l-2 border-[#4A1620]/20 pl-4 py-0.5">
                  <h4 className="font-bold text-sm">Ditjen Badan Peradilan Agama• Backend Developer</h4>
                  <p className="text-xs text-[#4A1620]/75 mt-0.5">
                    Arsitektur database & role-based access untuk portal
                    magang Ditjen Badilag RI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Halaman 2: Next Journey (Menuju seksi Contact) */}
      <NextJourneySummary
        active={active && startSummaryAnim}
        onNavigate={onNextJourney}
        scrollerRef={scrollerRef}
      />
    </div>
  )
}

export default Summary
