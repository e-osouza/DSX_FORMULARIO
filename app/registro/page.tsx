"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Mock functions since Supabase isn't configured
const createLead = async (data: any) => {
  console.log("Creating lead:", data)
  return { id: "mock-lead-id-" + Date.now() }
}

const completeLead = async (email: string, data: any) => {
  console.log("Completing lead:", email, data)
}

export default function Registro() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [step, setStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [leadId, setLeadId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const finalizingRef = useRef(false)
  const [tempEmpresa, setTempEmpresa] = useState("")

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    perfil: "",
    empresa: "",
    faturamento: "",
  })

  const [errors, setErrors] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    perfil: "",
    empresa: "",
    faturamento: "",
  })

  const questions = [
    {
      key: "nome",
      label: "Qual é o seu nome completo?",
      placeholder: "Ex: Pedro Cabral dos Santos",
      type: "text",
    },
    {
      key: "email",
      label: "Qual é seu melhor e-mail?",
      placeholder: "Ex: pedro@gmail.com",
      type: "email",
    },
    {
      key: "whatsapp",
      label: "Qual é o seu WhatsApp?",
      placeholder: "(92) 9 0000-0000",
      type: "tel",
    },
    {
      key: "perfil",
      label: "Você é?",
      placeholder: "Selecione uma opção",
      type: "radio",
      options: [
        "Empresário",
        "Diretor ou Gestor",
        "Profissional de marketing, vendas e operações",
        "Estudante",
        "Outros",
      ],
    },
    {
      key: "empresa",
      label: "Qual o nome da sua empresa ou da empresa que você atua?",
      placeholder: "Ex: Amazon, Google, Minha Empresa Ltda",
      type: "text",
    },
    {
      key: "faturamento",
      label: "Qual o faturamento dessa empresa?",
      placeholder: "Selecione uma opção",
      type: "radio",
      options: [
        "Abaixo de 700 mil por ano",
        "Fatura até 1 milhão por ano",
        "De R$ 1 milhão a R$ 5 milhões",
        "De R$ 5 milhões a R$ 20 milhões",
        "Acima de R$ 20 milhões",
      ],
    },
  ]

  const getFirstName = () => {
    return formData.nome.trim().split(" ")[0] || ""
  }

  const getCurrentLabel = () => {
    const firstName = getFirstName()
    const currentQuestion = questions[step]
    const shouldUseName = firstName && step > 0 && (step % 2 !== 0 || step === 4)

    if (shouldUseName) {
      const label = currentQuestion.label
      const labelWithLowerCase = label.charAt(0).toLowerCase() + label.slice(1)
      // 👇 aqui estava o erro, antes estava `${firstName,} ...`
      return `${firstName}, ${labelWithLowerCase}`
    }

    return currentQuestion.label
  }

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
  const quality = { lineCount: 8, shadowBlur: 12, step: 4 }

  const colors = {
    deepBlack: "#000000",
    darkerBlack: "#050505",
    darkGray: "#0a0a0a",
    darkOrange: "#936103",
    orange: "#c48104",
    vibrantOrange: "#f5a205",
  }

  // helper pra pegar canvas + ctx com segurança
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

    const gradient = ctx.createRadialGradient(
      w / 2,
      h / 2,
      0,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.8,
    )
    gradient.addColorStop(0, colors.deepBlack)
    gradient.addColorStop(0.3, colors.darkerBlack)
    gradient.addColorStop(0.6, colors.darkGray)
    gradient.addColorStop(0.8, colors.darkOrange)
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

    ctx.shadowBlur = quality.shadowBlur
    ctx.shadowColor = "rgba(255, 136, 51, 0.5)"
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
      const orangeIntensity = Math.min(255, 200 + i * 10)
      ctx.strokeStyle = `rgba(${orangeIntensity}, ${100 + i * 15}, ${51 + i * 5}, ${alpha})`
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

  // se não tiver canvas/ctx disponível, nem inicia
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


  useEffect(() => {
    inputRef.current?.focus()
  }, [step])

  const validateField = (key: string, value: string): string => {
    if (key === "nome") {
      if (!value.trim()) return "Digite seu nome completo."
      if (value.trim().split(" ").length < 2) return "Digite seu nome completo."
    }
    if (key === "email") {
      if (!value.trim()) return "Digite um e-mail válido."
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) return "Digite um e-mail válido."
    }
    if (key === "whatsapp") {
      if (!value.trim()) return "Digite um WhatsApp válido."
      const numbers = value.replace(/\D/g, "")
      if (numbers.length !== 11) return "Digite um WhatsApp válido."
    }
    if (key === "perfil") {
      if (!value.trim()) return "Por favor, selecione uma opção."
    }
    if (key === "empresa") {
      if (!value.trim()) return "Digite o nome da empresa."
      if (value.trim().length < 2) return "Digite um nome válido."
    }
    if (key === "faturamento") {
      if (!value.trim()) return "Por favor, selecione uma opção."
    }
    return ""
  }

  const maskWhatsApp = (value: string): string => {
    const numbers = value.replace(/\D/g, "").slice(0, 11)
    if (numbers.length === 0) return ""
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 3) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handleInputChange = (value: string) => {
    const currentKey = questions[step].key as keyof typeof formData
    let maskedValue = currentKey === "whatsapp" ? maskWhatsApp(value) : value
    if (currentKey === "email") {
      maskedValue = maskedValue.toLowerCase()
    }
    setFormData((prev) => ({ ...prev, [currentKey]: maskedValue }))
    if (errors[currentKey]) {
      setErrors((prev) => ({ ...prev, [currentKey]: "" }))
    }
    if (currentKey === "empresa") {
      setTempEmpresa(maskedValue)
    }
  }

  const handleRadioSelection = async (value: string) => {
    const currentKey = questions[step].key as keyof typeof formData
    setFormData((prev) => ({ ...prev, [currentKey]: value }))
    if (errors[currentKey]) {
      setErrors((prev) => ({ ...prev, [currentKey]: "" }))
    }
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step])
    }

    if (currentKey === "perfil") {
      if (value === "Empresário" || value === "Diretor ou Gestor") {
        setStep(step + 1)
        return
      }
      if (finalizingRef.current) return
      finalizingRef.current = true
      setIsNavigating(true)
      if (formData.email) {
        try {
          setIsSaving(true)
          await completeLead(formData.email, { perfil: value })
        } catch (error) {
          console.error("Erro ao completar lead:", error)
        } finally {
          setIsSaving(false)
        }
      }
      router.push("/obrigado")
      return
    }

    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      if (finalizingRef.current) return
      finalizingRef.current = true
      setIsNavigating(true)
      if (formData.email) {
        try {
          setIsSaving(true)
          await completeLead(formData.email, {
            perfil: formData.perfil,
            empresa: tempEmpresa || formData.empresa,
            faturamento: value,
          })
        } catch (error) {
          console.error("Erro ao completar lead:", error)
        } finally {
          setIsSaving(false)
        }
      }
      router.push("/obrigado")
    }
  }

  const handleNext = async () => {
    const currentKey = questions[step].key as keyof typeof formData
    const currentValue = formData[currentKey]
    const error = validateField(currentKey, String(currentValue))
    if (error) {
      setErrors((prev) => ({ ...prev, [currentKey]: error }))
      return
    }
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step])
    }

    if (step === 2 && !leadId) {
      try {
        setIsSaving(true)
        const lead = await createLead({
          nome: formData.nome,
          email: formData.email,
          whatsapp: formData.whatsapp,
        })
        setLeadId(lead.id)
      } catch (error) {
        console.error("Erro ao criar lead:", error)
        return
      } finally {
        setIsSaving(false)
      }
    }

    if (step < questions.length - 1) {
      setStep(step + 1)
    }
  }

  const handleNavigateNext = () => {
    if (step < questions.length - 1 && completedSteps.includes(step + 1)) {
      setStep(step + 1)
    }
  }

  const handleNavigatePrev = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const currentQuestion = questions[step]
  const currentValue = formData[currentQuestion.key as keyof typeof formData]
  const currentError = errors[currentQuestion.key as keyof typeof errors]

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="relative w-full max-w-[640px] min-h-screen overflow-hidden p-4 flex flex-col items-center justify-center gap-8">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-[1] w-full h-full block"
          style={{ transform: "translateZ(0)" }}
        />

        <div className="relative z-[2] flex flex-col items-center gap-2">
          <img
            src="/logo-dsx.svg"
            alt="DSX Logo"
            className="w-[280px] md:w-[320px] h-auto"
          />
        </div>

        <div className="relative z-[3] w-full max-w-[700px]">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-white/20 shadow-2xl">
            <div className="rounded-2xl px-6 py-4 bg-white/20 text-white mb-6">
              <h2 className="text-[18px] md:text-[20px] font-medium leading-relaxed">
                {getCurrentLabel()}
              </h2>
            </div>

            {currentQuestion.type === "radio" ? (
              <div className="space-y-3 mb-4">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleRadioSelection(option)}
                    disabled={isSaving || isNavigating}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-[15px] font-medium ${
                      isNavigating || isSaving
                        ? "opacity-60 cursor-not-allowed bg-white/90 border-gray-200 text-gray-700"
                        : currentValue === option
                          ? "bg-white border-[#f5a205] text-gray-900 shadow-md"
                          : "bg-white/90 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-white"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-row gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  {currentQuestion.key === "whatsapp" ? (
                    <div
                      className={`flex items-center h-14 rounded-xl bg-white text-gray-800 text-[15px] border-2 transition-all shadow-sm ${
                        currentError ? "border-red-500" : "border-gray-200 focus-within:border-[#f5a205]"
                      }`}
                    >
                      <span className="pl-4 pr-2 font-medium text-gray-600 whitespace-nowrap text-[15px]">
                        +55
                      </span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={String(currentValue ?? "")}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleNext()}
                        placeholder={currentQuestion.placeholder}
                        className="flex-1 h-full bg-transparent outline-none placeholder:text-gray-400 pr-4 text-[15px]"
                      />
                    </div>
                  ) : (
                    <input
                      ref={inputRef}
                      type={currentQuestion.type || "text"}
                      value={String(currentValue ?? "")}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleNext()}
                      placeholder={currentQuestion.placeholder}
                      className={`w-full h-14 px-4 rounded-xl bg-white text-gray-800 text-[15px] outline-none placeholder:text-gray-400 border-2 transition-all shadow-sm ${
                        currentError ? "border-red-500" : "border-gray-200 focus:border-[#f5a205]"
                      }`}
                    />
                  )}
                </div>

                <button
                  onClick={handleNext}
                  disabled={isSaving}
                  className="h-14 w-14 rounded-xl bg-[#f5a205] hover:bg-[#dc9104] active:scale-95 transition-all flex items-center justify-center text-white shadow-lg shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronRight className="w-6 h-6" />
                  )}
                </button>
              </div>
            )}

            {currentError && (
              <div className="rounded-xl px-6 py-3 bg-red-500/20 border border-red-500/40 mb-4">
                <p className="text-red-200 text-[15px]">{currentError}</p>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={handleNavigatePrev}
                disabled={step === 0}
                className={`h-10 w-10 rounded-lg border border-white/20 backdrop-blur-sm flex items-center justify-center transition-all ${
                  step === 0
                    ? "opacity-20 cursor-not-allowed"
                    : "opacity-60 hover:opacity-100 hover:bg-white/10 active:scale-95"
                }`}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={handleNavigateNext}
                disabled={step === questions.length - 1 || !completedSteps.includes(step + 1)}
                className={`h-10 w-10 rounded-lg border border-white/20 backdrop-blur-sm flex items-center justify-center transition-all ${
                  step === questions.length - 1 || !completedSteps.includes(step + 1)
                    ? "opacity-20 cursor-not-allowed"
                    : "opacity-60 hover:opacity-100 hover:bg-white/10 active:scale-95"
                }`}
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === step
                      ? "w-8 bg-[#f5a205]"
                      : index < step
                        ? "w-2 bg-white/60"
                        : "w-2 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}