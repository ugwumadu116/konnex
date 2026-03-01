import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const contact = await prisma.contact.findFirst({
    where: { id: params.id, workspaceId: (session.user as any).workspaceId },
    include: { company: true, deals: { include: { stage: true } }, activities: { orderBy: { createdAt: "desc" } } },
  })

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(contact)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await req.json()
  const contact = await prisma.contact.updateMany({
    where: { id: params.id, workspaceId: (session.user as any).workspaceId },
    data,
  })

  if (contact.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  
  const updated = await prisma.contact.findUnique({ where: { id: params.id }, include: { company: true } })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.activity.deleteMany({ where: { contactId: params.id, workspaceId: (session.user as any).workspaceId } })
  await prisma.deal.updateMany({ where: { contactId: params.id }, data: { contactId: null } })
  await prisma.contact.deleteMany({
    where: { id: params.id, workspaceId: (session.user as any).workspaceId },
  })

  return NextResponse.json({ success: true })
}
