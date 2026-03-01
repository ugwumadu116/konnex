import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const company = await prisma.company.findFirst({
    where: { id: params.id, workspaceId: (session.user as any).workspaceId },
    include: {
      contacts: true,
      deals: { include: { stage: true } },
      activities: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(company)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await req.json()
  await prisma.company.updateMany({
    where: { id: params.id, workspaceId: (session.user as any).workspaceId },
    data,
  })

  const updated = await prisma.company.findUnique({ where: { id: params.id } })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.contact.updateMany({ where: { companyId: params.id }, data: { companyId: null } })
  await prisma.activity.deleteMany({ where: { companyId: params.id } })
  await prisma.deal.updateMany({ where: { companyId: params.id }, data: { companyId: null } })
  await prisma.company.deleteMany({
    where: { id: params.id, workspaceId: (session.user as any).workspaceId },
  })

  return NextResponse.json({ success: true })
}
