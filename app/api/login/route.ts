// app/api/login/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {

    const response = NextResponse.json(
      { message: "Cookie de sessão criado" },
      { status: 200 },
    )

    // aqui é só a "bandeirinha" pro middleware
    response.cookies.set({
      name: "auth",
      value: "true",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
    })

    return response
  } catch (error) {
    console.error("Erro em /api/login:", error)
    return NextResponse.json(
      { message: "Erro interno ao criar sessão" },
      { status: 500 },
    )
  }
}