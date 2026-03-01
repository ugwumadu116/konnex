import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""

  const companies = await prisma.company.findMany({
    where: {
      workspaceId: (session.user as any).workspaceId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { industry: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: { _count: { select: { contacts: true, deals: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(companies)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await req.json()
  const company = await prisma.company.create({
    data: {
      ...data,
      workspaceId: (session.user as any).workspaceId,
      createdById: (session.user as any).id,
    },
  })

  return NextResponse.json(company, { status: 201 })
}
