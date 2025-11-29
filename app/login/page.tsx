"use client"

import { useState, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, LogIn } from "lucide-react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase" // 👈 importa o auth

export default function LoginPage() {
  const [username, setUsername] = useState("")   // aqui vamos usar como EMAIL
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/leads"

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1) Login no Firebase Auth
      await signInWithEmailAndPassword(auth, username, password)

      // 2) Chama /api/login só pra setar o cookie de auth pro middleware
      await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }).catch(() => {})

      // 3) Redireciona
      router.push(from)
    } catch (err: any) {
      console.error("Erro no login:", err)
      let message = "Credenciais inválidas."

      if (err?.code === "auth/user-not-found") {
        message = "Usuário não encontrado."
      } else if (err?.code === "auth/wrong-password") {
        message = "Senha incorreta."
      } else if (err?.code === "auth/invalid-email") {
        message = "E-mail inválido."
      }

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-black mb-2">Acesso Restrito</h1>
          <p className="text-sm text-black">
            Área administrativa — faça login para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-black"
            >
              E-mail
            </label>
            <input
              id="username"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-[var(--cinzaclaro)] rounded-lg shadow-sm text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-[var(--amarelo)] focus:border-[var(--amarelo)] text-sm"
              placeholder="admin@exemplo.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-[var(--cinzaclaro)] rounded-lg shadow-sm text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-[var(--amarelo)] focus:border-[var(--amarelo)] text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-[var(--amarelo)] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[var(--amarelo)] disabled:bg-[var(--amarelo)] disabled:cursor-not-allowed transition cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Entrar
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-2">
            O acesso aos leads é protegido.
          </p>
        </form>
      </div>
    </main>
  )
}