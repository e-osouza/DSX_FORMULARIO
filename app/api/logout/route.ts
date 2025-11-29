// app/api/logout/route.ts
import { NextResponse } from "next/server"

export async function POST() {
  // cria a resposta
  const response = NextResponse.json(
    { message: "Logout realizado" },
    { status: 200 },
  )

  // 1) opção: deletar cookie explicitamente
  response.cookies.delete("auth")

  // 2) (opcional) garantir expiração
  // response.cookies.set({
  //   name: "auth",
  //   value: "",
  //   path: "/",
  //   maxAge: 0,
  // })

  return response
}