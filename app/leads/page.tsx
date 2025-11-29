"use client"

import { useRouter } from "next/navigation"
import { LogOut, Users, Filter, RefreshCw } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"

type Lead = {
  id: string
  nome: string
  email: string
  whatsapp: string
  perfil: string
  empresa: string
  faturamento: string
  criadoEm: string
}

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(10) // mostra 2 por vez

  // função para carregar leads do Firestore
  const loadLeads = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const q = query(collection(db, "leads"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)

      const data: Lead[] = snapshot.docs.map((doc) => {
        const d = doc.data() as any

        return {
          id: doc.id,
          nome: d.nome ?? "",
          email: d.email ?? "",
          whatsapp: d.whatsapp ?? "",
          perfil: d.perfil ?? "",
          empresa: d.empresa ?? "",
          faturamento: d.faturamento ?? "",
          criadoEm: d.createdAt?.toDate
            ? d.createdAt.toDate().toLocaleString("pt-BR")
            : d.createdAt ?? "",
        }
      })

      setLeads(data)
      setVisibleCount(10) // reseta paginação ao recarregar
    } catch (err) {
      console.error("Erro ao carregar leads do Firebase:", err)
      setError("Não foi possível carregar os leads. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }, [])

  // carrega quando a página abre
  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  const filteredLeads = leads.filter((lead) => {
    if (!search.trim()) return true
    const term = search.toLowerCase()
    return (
      lead.nome.toLowerCase().includes(term) ||
      lead.email.toLowerCase().includes(term) ||
      lead.empresa.toLowerCase().includes(term) ||
      lead.perfil.toLowerCase().includes(term)
    )
  })

  // sempre que filtro ou lista mudar, volta a mostrar só 2
  useEffect(() => {
    setVisibleCount(10)
  }, [search, leads])

  const visibleLeads = filteredLeads.slice(0, visibleCount)
  const hasMore = visibleCount < filteredLeads.length

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" }).catch(() => {})
    } finally {
      router.push("/login")
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-[#eeeeee] bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-black">
              Painel de Leads
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Visualize os leads capturados pelo formulário DSX
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-xs md:text-sm px-3 py-2 rounded-lg bg-[var(--amarelo)] hover:bg-black hover:text-white transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-black">
            <Users className="w-4 h-4 text-[var(--amarelo)]" />
            <span>
              Leads filtrados:{" "}
              <span className="font-semibold text-black">
                {filteredLeads.length}
              </span>
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar por nome, email, empresa ou perfil..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-80 rounded-lg bg-[var(--cinzaclaro)] border border-[#eee] px-8 py-2 text-sm placeholder:text-black focus:outline-none focus:ring-2 focus:ring-[var(--amarelo)] focus:border-[var(--amarelo)]"
              />
              <Filter className="w-4 h-4 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="button"
              onClick={loadLeads}
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs md:text-sm px-3 py-2 rounded-lg bg-[var(--amarelo)] hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        </div>

        {error && (
          <div className="border border-red-500/40 bg-red-500/10 text-red-200 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl bg-[var(--cinzaclaro)]">
          {loading && !leads.length ? (
            <div className="py-10 text-center text-black text-sm">
              Carregando leads...
            </div>
          ) : (
            <>
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-[var(--amarelo)]">
                  <tr className="text-left text-black">
                    <th className="px-3 md:px-4 py-3 font-medium">Nome</th>
                    <th className="px-3 md:px-4 py-3 font-medium">Email</th>
                    <th className="px-3 md:px-4 py-3 font-medium hidden md:table-cell">
                      WhatsApp
                    </th>
                    <th className="px-3 md:px-4 py-3 font-medium hidden md:table-cell">
                      Perfil
                    </th>
                    <th className="px-3 md:px-4 py-3 font-medium">Empresa</th>
                    <th className="px-3 md:px-4 py-3 font-medium hidden md:table-cell">
                      Faturamento
                    </th>
                    <th className="px-3 md:px-4 py-3 font-medium hidden md:table-cell">
                      Criado em
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleLeads.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-black"
                      >
                        Nenhum lead encontrado com esse filtro.
                      </td>
                    </tr>
                  ) : (
                    visibleLeads.map((lead, index) => (
                      <tr
                        key={lead.id}
                        className={
                          `${index % 2 === 0 
                            ? "bg-[var(--cinzaclaro)]" 
                            : "bg-[#ffffff]"} 
                          hover:bg-[var(--amarelo)] transition`
                        }
                      >
                        <td className="px-3 md:px-4 py-3 font-medium">{lead.nome}</td>
                        <td className="px-3 md:px-4 py-3">{lead.email}</td>
                        <td className="px-3 md:px-4 py-3 hidden md:table-cell">{lead.whatsapp}</td>
                        <td className="px-3 md:px-4 py-3 hidden md:table-cell">{lead.perfil}</td>
                        <td className="px-3 md:px-4 py-3">{lead.empresa}</td>
                        <td className="px-3 md:px-4 py-3 hidden md:table-cell">{lead.faturamento}</td>
                        <td className="px-3 md:px-4 py-3 hidden md:table-cell text-xs text-black">
                          {lead.criadoEm}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {hasMore && (
                <div className="py-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="px-4 py-2 text-xs md:text-sm rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 transition cursor-pointer"
                  >
                    Carregar mais
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}