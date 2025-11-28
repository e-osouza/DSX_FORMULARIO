"use client"

import { useEffect, useRef, useState } from "react"

export default function ThankYou() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    let w = 0,
      h = 0,
      t = 0
    let animationId = 0
    let running = true
    let lastTime = performance.now()
    let gradientCache: CanvasGradient | null = null

    let frameCount = 0
    const startTime = performance.now()
    const quality = { lineCount: 8, shadowBlur: 12, step: 4 }

    const colors = {
      deepBlack: "#000000",
      darkGray: "#0a0a0a",
      darkestGreen: "#1a5e2f",
      darkGreen: "#2d8f47",
      vibrantGreen: "#4ecb58",
      lightGreen: "#5fd66a",
    }

    function resize() {
      if (!canvas) return
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
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8)
      gradient.addColorStop(0, colors.deepBlack)
      gradient.addColorStop(0.3, colors.darkGray)
      gradient.addColorStop(0.6, colors.darkestGreen)
      gradient.addColorStop(0.8, colors.darkGreen)
      gradient.addColorStop(1, colors.vibrantGreen)
      gradientCache = gradient
      const samplesTarget = 200
      quality.step = Math.max(3, Math.round(w / samplesTarget))
    }

    function draw(now: number) {
      if (!running) return
      const dt = now - lastTime
      if (dt < 30) {
        animationId = requestAnimationFrame(draw)
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
      ctx.shadowBlur = quality.shadowBlur
      ctx.shadowColor = "rgba(78, 203, 88, 0.5)"
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
        const alpha = 0.3 + i * 0.08
        const greenIntensity = Math.min(255, 78 + i * 15)
        ctx.strokeStyle = `rgba(${greenIntensity}, ${200 + i * 5}, ${88 + i * 10}, ${alpha})`
        ctx.stroke()
      }
      animationId = requestAnimationFrame(draw)
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(animationId)
      } else {
        if (!running) {
          running = true
          lastTime = performance.now()
          animationId = requestAnimationFrame(draw)
        }
      }
    }

    window.addEventListener("resize", resize, { passive: true })
    document.addEventListener("visibilitychange", handleVisibilityChange)
    resize()
    animationId = requestAnimationFrame(draw)

    return () => {
      running = false
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      cancelAnimationFrame(animationId)
    }
  }, [])

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
                  backgroundColor: ["#4ecb58", "#5fd66a", "#FFA500", "#ffffff"][i % 4],
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
              Sua vaga está reservada <span className="text-[#4ecb58]">por tempo limitado!</span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto px-4">
              Complete sua inscrição agora e garanta acesso ao{" "}
              <span className="font-semibold text-[#4ecb58]">evento mais aguardado do ano</span>
            </p>

            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-lg">
              <svg className="w-5 h-5 text-[#4ecb58]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-white font-medium">Pré-inscrição confirmada</span>
            </div>
          </div>

          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl md:text-7xl font-bold text-white">{Math.round(progress)}%</div>
                <div className="text-lg md:text-xl text-white/90 mt-2">Gerando seu acesso...</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-base md:text-lg text-white/80">Redirecionando para finalizar sua inscrição...</p>
          </div>
        </div>
      </div>
    </section>
  )
}
