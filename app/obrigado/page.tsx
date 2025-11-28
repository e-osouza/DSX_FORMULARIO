"use client"

import { useEffect, useRef, useState } from "react"

export default function ThankYou() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  // ====================== CANVAS ANIMADO AJUSTADO PARA TS ======================
  useEffect(() => {
    let w = 0
    let h = 0
    let t = 0
    let animationId = 0
    let running = true
    let lastTime = performance.now()
    let gradientCache: CanvasGradient | null = null

    let frameCount = 0
    const startTime = performance.now()

    const quality = {
      lineCount: 8,
      shadowBlur: 12,
      step: 4,
    }

    // PALETA 100% LARANJA (#F5A205)
    const colors = {
      black: "#000000",
      dark1: "#0a0700",
      dark2: "#2b1a00",
      orangeDeep: "#C47F04",
      orange: "#F5A205",
      orangeLight: "#FFC550",
    }

    // helper: pegar canvas + ctx
    const getCanvasAndContext = () => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const ctx = canvas.getContext("2d")
      if (!ctx) return null
      return { canvas, ctx }
    }

    function resize() {
      const result = getCanvasAndContext()
      if (!result) return

      const { canvas, ctx } = result

      const parent = canvas.parentElement
      const rect = parent?.getBoundingClientRect()
      const targetW = Math.floor(rect?.width ?? window.innerWidth)
      const targetH = Math.floor(rect?.height ?? window.innerHeight)
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25)

      canvas.width = Math.round(targetW * dpr)
      canvas.height = Math.round(targetH * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      w = targetW
      h = targetH

      // GRADIENTE LARANJA
      const gradient = ctx.createRadialGradient(
        w / 2, h / 2, 0,
        w / 2, h / 2, Math.max(w, h) * 0.85
      )
      gradient.addColorStop(0, colors.black)
      gradient.addColorStop(0.25, colors.dark1)
      gradient.addColorStop(0.55, colors.dark2)
      gradient.addColorStop(0.75, colors.orangeDeep)
      gradient.addColorStop(1, colors.orange)

      gradientCache = gradient

      const samplesTarget = 200
      quality.step = Math.max(3, Math.round(w / samplesTarget))
    }

    function draw(now: number) {
      if (!running) return

      const result = getCanvasAndContext()
      if (!result) return

      const { ctx } = result

      const dt = now - lastTime

      // limita FPS
      if (dt < 30) {
        animationId = window.requestAnimationFrame(draw)
        return
      }

      lastTime = now
      frameCount++

      if (now - startTime > 1000 && now - startTime < 1100 && frameCount < 40) {
        quality.lineCount = 5
        quality.shadowBlur = 8
        quality.step = Math.max(quality.step, 5)
      }

      t += 0.003 * (dt / 16.67)

      ctx.clearRect(0, 0, w, h)

      if (gradientCache) {
        ctx.fillStyle = gradientCache
        ctx.fillRect(0, 0, w, h)
      }

      // sombra laranja
      ctx.shadowBlur = quality.shadowBlur
      ctx.shadowColor = "rgba(245, 162, 5, 0.4)" // → #F5A205 com transparência
      ctx.lineWidth = 2.5

      for (let i = 0; i < quality.lineCount; i++) {
        ctx.beginPath()
        const baseOffset = i * 50
        const layerPhase = i * 0.4

        for (let x = 0; x <= w; x += quality.step) {
          const diagonalY = h - (x / w) * h
          const wave1 = Math.sin(x * 0.008 + t * 2.5 + layerPhase) * 35
          const wave2 = Math.cos(x * 0.012 - t * 2 + layerPhase * 0.7) * 20
          const wave3 = Math.sin(x * 0.005 + t * 1.5 + layerPhase * 1.2) * 15
          const y = diagonalY + wave1 + wave2 + wave3 + baseOffset - h * 0.15
          ctx.lineTo(x, y)
        }

        const alpha = 0.25 + i * 0.07

        // LINHAS 100% LARANJA VARIADAS
        const r = Math.min(255, 245 + i * 1) // base #F5
        const g = Math.min(200, 162 + i * 5)
        const b = Math.min(80, 5 + i * 8)

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx.stroke()
      }

      animationId = window.requestAnimationFrame(draw)
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        running = false
        window.cancelAnimationFrame(animationId)
      } else {
        if (!running) {
          running = true
          lastTime = performance.now()
          animationId = window.requestAnimationFrame(draw)
        }
      }
    }

    if (!getCanvasAndContext()) return

    const handleResize = () => resize()

    window.addEventListener("resize", handleResize)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    resize()
    animationId = window.requestAnimationFrame(draw)

    return () => {
      running = false
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.cancelAnimationFrame(animationId)
    }
  }, [])
  // =================== FIM DO CANVAS ===================

  // Progress and confetti animation
  useEffect(() => {
    setShowConfetti(true)
    const confettiTimer = setTimeout(() => setShowConfetti(false), 6000)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (3500 / 50)
        if (newProgress >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return newProgress
      })
    }, 50)

    return () => {
      clearTimeout(confettiTimer)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="relative w-full max-w-[640px] min-h-screen overflow-hidden px-5 grid place-items-center">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-[1] block" />

        {showConfetti && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-4 animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ["#ab7103", "#dc9104", "#FFA500", "#ffffff"][i % 4],
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2.5 + Math.random() * 2.5}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-[3] w-full max-w-[900px] flex flex-col items-center gap-8 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight px-4">
              Você está oficialmente participando do <span className="text-[#f5a205]">sorteio do par de ingressos.</span>
            </h1>

            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-lg">
              <svg className="w-5 h-5 text-[#f5a205]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-white font-medium">Inscrição confirmada</span>
            </div>
          </div>

          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl md:text-7xl font-bold text-white">
                  {Math.round(progress)}%
                </div>
                <div className="text-lg md:text-xl text-white/90 mt-2">Participação confirmada!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}