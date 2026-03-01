import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const companyId = searchParams.get("companyId")

  const where: any = {
    workspaceId: (session.user as any).workspaceId,
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(companyId && { companyId }),
  }

  const contacts = await prisma.contact.findMany({
    where,
    include: { company: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(contacts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await req.json()
  const contact = await prisma.contact.create({
    data: {
      ...data,
      workspaceId: (session.user as any).workspaceId,
      createdById: (session.user as any).id,
    },
    include: { company: true },
  })

  return NextResponse.json(contact, { status: 201 })
}
