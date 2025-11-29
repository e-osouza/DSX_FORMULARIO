"use client"

import { useEffect, useState } from "react"
import { Loader2, Mail, Phone, Building2, TrendingUp, User } from "lucide-react"
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Pessoa {
  id?: string
  nome: string
  email: string
  whatsapp: string
  perfil: string
  empresa: string
  faturamento: string
}

export default function ListaPessoas() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

useEffect(() => {
  setLoading(true)
  setError(null)

  const leadsRef = collection(db, "leads")
  const q = query(leadsRef, orderBy("createdAt", "desc"))

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const lista: Pessoa[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Pessoa, "id">),
      }))

      setPessoas(lista)
      setLoading(false)
    },
    (err) => {
      console.error("Erro ao ouvir pessoas:", err)
      setError("Erro ao carregar dados do Firebase")
      setLoading(false)
    }
  )

  return () => unsubscribe()
}, [])


  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Lista de Pessoas</h1>
          <p className="text-gray-600">Visualize e gerencie todos os registros cadastrados</p>
          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error}
            </p>
          )}
        </div>

        {/* Empty State */}
        {pessoas.length === 0 && !error && (
          <div className="shadow-lg">
            <div className="pt-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Nenhuma pessoa cadastrada</p>
              <p className="text-gray-500 text-sm mt-2">
                Os registros aparecerão aqui quando forem adicionados
              </p>
            </div>
          </div>
        )}

        {/* Lista em Cards (Mobile) e Tabela (Desktop) */}
        {pessoas.length > 0 && (
          <>
            {/* Grid para Mobile/Tablet */}
            <div className="grid grid-cols-1 md:hidden gap-4">
              {pessoas.map((pessoa, index) => (
                <div key={pessoa.id || index} className="shadow-lg hover:shadow-xl transition-shadow">
                  <div className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{pessoa.nome}</h3>
                          <p className="text-sm text-gray-500 mt-1">{pessoa.perfil}</p>
                        </div>
                      </div>

                      <div className="space-y-2 border-t pt-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <a
                            href={`mailto:${pessoa.email}`}
                            className="text-sm text-blue-600 hover:underline truncate"
                          >
                            {pessoa.email}
                          </a>
                        </div>

                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <a
                            href={`tel:${pessoa.whatsapp}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {pessoa.whatsapp}
                          </a>
                        </div>

                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{pessoa.empresa || "—"}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700 font-medium">{pessoa.faturamento}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela para Desktop */}
            <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <th className="px-6 py-4 text-left text-sm font-semibold">Nome</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">WhatsApp</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Perfil</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Empresa</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Faturamento</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {pessoas.map((pessoa, index) => (
                      <tr key={pessoa.id || index} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{pessoa.nome}</span>
                        </td>
                        <td className="px-6 py-4">
                          <a href={`mailto:${pessoa.email}`} className="text-blue-600 hover:underline text-sm">
                            {pessoa.email}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <a href={`tel:${pessoa.whatsapp}`} className="text-blue-600 hover:underline text-sm">
                            {pessoa.whatsapp}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {pessoa.perfil}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{pessoa.empresa || "—"}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{pessoa.faturamento}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rodapé da Tabela */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Total de registros:{" "}
                  <span className="font-semibold text-gray-900">{pessoas.length}</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}