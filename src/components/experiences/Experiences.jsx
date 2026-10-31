import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import KineticTextGrid from './KineticTextGrid'
import HoverImageReveal from './HoverImageReveal'
import SkewInText from './SkewInText'
import ProjectModal from './ProjectModal'
import NextJourneyExperiences from './NextJourneyExperiences'
import lsfGrid from '../../assets/lsf-grid.png'
import badilagGrid from '../../assets/badilag-grid.png'

// Import asset screens LSF
import lsfLogin from '../../assets/lsf/login-lsf.png'
import lsfMahasiswa from '../../assets/lsf/mahasiswa-lsf.png'
import lsfPembimbing from '../../assets/lsf/pembimbing-lsf.png'
import lsfSuperadmin from '../../assets/lsf/superadmin-admin-lsf.png'
import lsfWelcome from '../../assets/lsf/welcome-lsf.png'

// Import asset screens Badilag
import badilagKegiatan from '../../assets/badilag/kegiatan-badilag.png'
import badilagLogin from '../../assets/badilag/login-badilag.png'
import badilagLowongan from '../../assets/badilag/lowongan-badilag.png'
import badilagPendaftaran from '../../assets/badilag/pendaftaran-badilag.png'
import badilagWelcome from '../../assets/badilag/welcome-badilag.png'

// Import asset DMDI (thumbnail grid + screens)
import dmdiGrid from '../../assets/dmdi/dmdi-grid.png'
import dmdiBeranda from '../../assets/dmdi/01-beranda-dmdi.png'
import dmdiKhutbah from '../../assets/dmdi/02-khutbah-dmdi.png'
import dmdiBuku from '../../assets/dmdi/03-buku-dmdi.png'
import dmdiOpini from '../../assets/dmdi/04-opini-dmdi.png'
import dmdiAdmin from '../../assets/dmdi/05-admin-dmdi.png'

gsap.registerPlugin(ScrollTrigger)

const EXPERIENCES_DATA = [
  {
    company: "Lembaga Sensor Film RI",
    period: "Jan 2026 - Mar 2026",
    role: "Fullstack Developer",
    image: { src: lsfGrid }
  },
  {
    company: "Ditjen Badan Peradilan Agama",
    period: "Oct 2025 - Dec 2025",
    role: "Backend Developer",
    image: { src: badilagGrid }
  },
]

const PROJECTS_DATA = [
  {
    company: "Dewan Masjid Digital Indonesia",
    period: "Freelance",
    role: "Backend Developer",
    image: { src: dmdiGrid },
    details: {
      title: "Dewan Masjid Digital Indonesia",
      role: "Backend Developer (Freelance)",
      description: "Membangun website CMS untuk publikasi khutbah Jumat mingguan dalam sekitar 12 varian bahasa (Indonesia, Arab, Jawa, Sunda, dll.), lengkap dengan thumbnail dan PDF yang bisa diunduh. Merancang panel admin custom untuk mengelola naskah khutbah berbasis block JSON, buku, admin, dan inbox opini/pertanyaan dengan balasan via email. Menerapkan autentikasi JWT, rate limiting, dan hardening keamanan form publik, lalu men-deploy ke VPS (Nginx, PM2, SSL) dengan CI/CD GitHub Actions serta memigrasikan situs WordPress/Elementor lama klien ke Next.js.",
      tech: ["Next.js", "Prisma ORM", "PostgreSQL", "JWT", "Nginx", "PM2", "GitHub Actions"],
      carouselImages: [
        {
          isInfo: true,
          title: "DMDI - Dewan Masjid Digital Indonesia",
          role: "Backend Developer",
          link: "https://dewanmasjiddigitalindonesia.com/",
          description: "Website CMS khutbah Jumat mingguan dengan ~12 varian bahasa, panel admin custom, autentikasi JWT, rate limiting, dan deployment otomatis via GitHub Actions ke VPS. Migrasi dari WordPress/Elementor ke Next.js 15.",
          tech: ["Next.js", "Prisma ORM", "PostgreSQL", "JWT", "Nginx", "PM2", "GitHub Actions"]
        },
        { src: dmdiBeranda },
        { src: dmdiKhutbah },
        { src: dmdiBuku },
        { src: dmdiOpini },
        { src: dmdiAdmin }
      ]
    }
  },
  {
    company: "Lembaga Sensor Film RI",
    period: "Contract",
    role: "Fullstack Developer",
    image: { src: lsfGrid },
    details: {
      title: "Lembaga Sensor Film RI",
      role: "Fullstack Developer (Internship)",
      description: "Saya membangun website SI-LSF (Sistem Informasi Lembaga Sensor Film) untuk memudahkan mahasiswa melakukan pendaftaran magang secara online dan mencatat logbook harian magang secara terintegrasi setelah diterima. Sistem ini merapikan administrasi data magang secara terpusat bagi pembimbing lapangan dan staf administrasi LSF agar data magang terkelola dengan baik dan tidak terpencar-pencar.",
      tech: ["PHP", "Laravel 10", "Vue.js", "Tailwind", "Inertia.js", "MySQL", "GitHub"],
      carouselImages: [
        { 
          isInfo: true, 
          title: "LSF - Lembaga Sensor Film", 
          role: "Fullstack Developer", 
          description: "Sistem Informasi Kerja Praktik & Magang SI-LSF. Mempermudah pendaftaran mahasiswa secara online, pencatatan logbook harian magang, serta memusatkan administrasi data magang bagi pembimbing lapangan dan staf LSF agar terorganisir.", 
          tech: ["PHP", "Laravel 10", "Vue.js", "Tailwind", "Inertia.js", "MySQL", "GitHub"] 
        },
        { src: lsfWelcome },
        { src: lsfLogin },
        { src: lsfMahasiswa, bgPos: "left center" },
        { src: lsfPembimbing, bgPos: "left center" },
        { src: lsfSuperadmin, bgPos: "left center" }
      ]
    }
  },
  {
    company: "Ditjen Badan Peradilan Agama",
    period: "Contract",
    role: "Backend Developer",
    image: { src: badilagGrid },
    details: {
      title: "Ditjen Badan Peradilan Agama",
      role: "Backend Developer (Internship)",
      description: "Pengembangan website portal pendaftaran magang untuk Direktorat Jendral Badan Peradilan Agama Mahkamah Agung RI dengan fokus utama pada sisi Backend. Bertanggung jawab atas perancangan Entity Relationship Diagram (ERD) database, arsitektur role-based access control, Validasi Data, Autentikasi saat login, pembuatan fitur fungsional untuk masing-masing user role, serta kontribusi minor pada pengerjaan visual antarmuka.",
      tech: ["PHP", "Laravel 10", "Vue.js", "Inertia.js", "Tailwind", "MySQL", "GitHub"],
      carouselImages: [
        { 
          isInfo: true, 
          title: "Badilag - Ditjen Badan Peradilan Agama",
          link: "https://magang.badilag.net/", 
          role: "Backend Developer", 
          description: "Portal pendaftaran magang Ditjen Badilag MA RI. Berfokus pada pengembangan backend, arsitektur role-based, perancangan Entity Relationship Diagram (ERD), Validasi Data, Autentikasi saat login, dan fungsionalitas fitur pengguna.", 
          tech: ["PHP", "Laravel 10", "Vue.js", "Inertia.js", "Tailwind", "MySQL", "GitHub"] 
        },
        { src: badilagWelcome },
        { src: badilagLogin },
        { src: badilagPendaftaran },
        { src: badilagKegiatan },
        { src: badilagLowongan }
      ]
    }
  },
]

function Experiences({ active = false, onBack, setNavbarVisible, onNextJourney, showNextJourneyCue = true }) {
  const containerRef = useRef(null)
  
  // Refs untuk seksi Experiences (Page 1)
  const titleRef = useRef(null)
  const lineRef = useRef(null)
  const listRef = useRef(null)
  
  // Refs untuk seksi Projects (Page 2)
  const projectsSectionRef = useRef(null)
  const projectsLineRef = useRef(null)
  const projectsListRef = useRef(null)
  
  const [kineticComplete, setKineticComplete] = useState(false)
  const [startProjectsAnim, setStartProjectsAnim] = useState(false)
  const [finalLeft, setFinalLeft] = useState(24)

  // State untuk mengontrol project detail modal
  const [selectedProject, setSelectedProject] = useState(null)
  // Titik klik user saat membuka project - jadi pusat animasi lingkaran mekar di ProjectModal
  const [clickOrigin, setClickOrigin] = useState(null)

  useEffect(() => {
    const handleResize = () => {
      const W = window.innerWidth
      if (W >= 1152) {
        setFinalLeft((W - 1152) / 2 + 24)
      } else {
        setFinalLeft(24)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!active) {
      window.globalLenis?.start()
      setKineticComplete(false)
      setStartProjectsAnim(false)
      setSelectedProject(null)
      if (titleRef.current) {
        gsap.set(titleRef.current, {
          position: 'absolute',
          left: '50%',
          top: '50%',
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          scale: window.innerWidth < 768 ? 1.33 : 3.33,
          fontSize: window.innerWidth < 768 ? '24px' : '24px',
          fontWeight: 700,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          textAlign: 'center',
          opacity: 0,
          color: '#4A1620',
          fontFamily: 'var(--font-display), "Archivo", sans-serif',
        })
      }
      if (lineRef.current) {
        gsap.set(lineRef.current, { scaleX: 0 })
      }
      if (listRef.current) {
        gsap.set(listRef.current, { opacity: 0, y: 30 })
      }
      if (projectsSectionRef.current) {
        gsap.set(projectsSectionRef.current, { opacity: 0, y: 0 })
      }
      if (projectsLineRef.current) {
        gsap.set(projectsLineRef.current, { scaleX: 0 })
      }
      if (projectsListRef.current) {
        gsap.set(projectsListRef.current, { opacity: 0, y: 30 })
      }
      return
    }

    // Kinetic Text Grid baru mulai main (active baru jadi true) - kunci
    // scroll sementara di sini. Tanpa ini, momentum/inersia dari Lenis
    // (smooth scroll) masih "meluncur" dikit selagi animasi Kinetic Text
    // main beberapa detik, jadi begitu animasinya selesai, posisi user udah
    // "kelewat" dari titik paling atas section Experiences - makanya harus
    // scroll manual lagi buat balik ke atas.
    window.globalLenis?.stop()

    // Set posisi awal Experiences di tengah layar saat aktif
    gsap.set(titleRef.current, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      scale: window.innerWidth < 768 ? 1.33 : 3.33,
      fontSize: window.innerWidth < 768 ? '24px' : '24px',
      fontWeight: 700,
      letterSpacing: '0.35em',
      textTransform: 'uppercase',
      textAlign: 'center',
      opacity: 0,
      color: '#4A1620',
      fontFamily: 'var(--font-display), "Archivo", sans-serif',
    })
    if (lineRef.current) {
      gsap.set(lineRef.current, { scaleX: 0 })
    }
    if (listRef.current) {
      gsap.set(listRef.current, { opacity: 0, y: 30 })
    }
    if (projectsSectionRef.current) {
      gsap.set(projectsSectionRef.current, { opacity: 0, y: 0 })
    }
    if (projectsLineRef.current) {
      gsap.set(projectsLineRef.current, { scaleX: 0 })
    }
    if (projectsListRef.current) {
      gsap.set(projectsListRef.current, { opacity: 0, y: 30 })
    }
  }, [active])

  // ScrollTrigger untuk memicu munculnya seksi Projects (Page 2)
  // setelah Experiences (Page 1) mulai bergeser ke atas. Pakai scroller
  // default (window) sekarang - dulu di-arahkan ke container scroll
  // bersarang, tapi itu sudah dihapus (lihat SpaceTransitionScroll.jsx).
  useEffect(() => {
    if (!active) return

    const context = gsap.context(() => {
      gsap.fromTo(projectsSectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: projectsSectionRef.current,
            start: 'top 45%',
            toggleActions: 'play none none none',
            onEnter: () => {
              setStartProjectsAnim(true)
            }
          }
        }
      )
    }, containerRef)

    return () => context.revert()
  }, [active])

  const handleKineticComplete = () => {
    setKineticComplete(true)

    const context = gsap.context(() => {
      gsap.set(titleRef.current, { opacity: 1 })

      const tl = gsap.timeline({
        onComplete: () => {
          // Animasi Kinetic Text Grid DAN seluruh isi halaman Experiences selesai
          // Baru di titik ini scroll dibuka lagi!
          window.globalLenis?.start()
        }
      })
      
      tl.to(titleRef.current, {
        left: finalLeft,
        top: '22vh',
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        fontSize: window.innerWidth < 768 ? '16px' : '24px',
        duration: 1.0,
        ease: 'power3.inOut',
      })
      .to(lineRef.current, {
        scaleX: 1,
        duration: 0.6,
        ease: 'power2.inOut',
      }, '-=0.4')
      .to(listRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3')
      
      setNavbarVisible?.(true)
    }, containerRef)
  }

  // Callback dipicu saat huruf-huruf Projects selesai skew-in
  const handleProjectsTitleComplete = () => {
    const context = gsap.context(() => {
      const tl = gsap.timeline()
      
      tl.to(projectsLineRef.current, {
        scaleX: 1,
        duration: 0.6,
        ease: 'power2.inOut',
      })
      .to(projectsListRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3')
    }, containerRef)
  }

  return (
    <div ref={containerRef} className="w-full bg-cream text-[#4A1620] relative overflow-x-hidden">
      
      {/* Halaman 1: Experiences (Mengisi 1 layar penuh min-h-screen) */}
      <div className="min-h-screen relative w-full pt-[28vh] pb-24">
        {/* Teks Judul Experiences */}
        <p
          ref={titleRef}
          style={{
            margin: 0,
            padding: 0,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 40,
          }}
        >
          EXPERIENCES
        </p>

        {/* Garis Pembatas Experiences */}
        <div
          ref={lineRef}
          className="absolute h-0.5 bg-[#4A1620]/25 z-20"
          style={{
            left: finalLeft,
            width: window.innerWidth - 2 * finalLeft,
            top: 'calc(22vh + 40px)',
            transformOrigin: 'left center',
          }}
        />

        {/* List Pengalaman */}
        <div ref={listRef} className="max-w-6xl w-full mx-auto px-6 opacity-0 relative z-10">
          <HoverImageReveal items={EXPERIENCES_DATA} textColor="#4A1620" dimColor="rgba(74, 22, 32, 0.35)" />
        </div>
      </div>

      {/* Halaman 2: Projects (Mengisi 1 layar penuh berikutnya min-h-screen) */}
      <div 
        ref={projectsSectionRef} 
        className="min-h-screen flex flex-col justify-center relative w-full py-24 opacity-0"
      >
        <div className="max-w-6xl w-full mx-auto px-6">
          
          {/* Projects Title (menggunakan SkewInText) */}
          <div className="flex items-center">
            <SkewInText 
              text="Projects"
              appearTrigger={startProjectsAnim ? "default" : "manual"}
              onLetterAnimationComplete={handleProjectsTitleComplete}
              font={{
                fontFamily: "var(--font-display), 'Archivo', sans-serif",
                fontWeight: 700,
                fontSize: window.innerWidth < 768 ? '16px' : '24px',
                lineHeight: "1.2em",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                textAlign: "left",
              }}
              color="#4A1620"
              width="auto"
              height="auto"
              startSkewX={-70}
              startX={300}
            />
          </div>

          {/* Garis Pembatas Projects */}
          <div
            ref={projectsLineRef}
            className="mt-4 h-0.5 w-full bg-[#4A1620]/25 origin-left"
            style={{
              transform: 'scaleX(0)',
            }}
          />

          {/* List Projects dengan Hover Image Reveal (period diganti "Contract" & cursorText "View") */}
          <div ref={projectsListRef} className="opacity-0 translate-y-10">
            <HoverImageReveal 
              items={PROJECTS_DATA} 
              textColor="#4A1620" 
              dimColor="rgba(74, 22, 32, 0.35)"
              cursorText="View"
              onItemClick={(item, _index, point) => {
                setClickOrigin(point)
                setSelectedProject(item.details)
              }}
            />
          </div>
        </div>
      </div>

      {/* Halaman 3: Next Journey (Menuju seksi Summary) */}
      <NextJourneyExperiences 
        active={active && startProjectsAnim} 
        onNavigate={onNextJourney} 
        showCue={showNextJourneyCue}
      />

      {/* Grid Animasi Kinetic Text Grid (Appear Text) */}
      {active && !kineticComplete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none">
          <KineticTextGrid onComplete={handleKineticComplete} />
        </div>
      )}

      {/* MODAL DETAIL PROJECT - animasi masuk/keluar & carousel ada di ProjectModal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          origin={clickOrigin}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}

export default Experiences
