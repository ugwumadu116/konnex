import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const deal = await prisma.deal.findFirst({
    where: { id: params.id, workspaceId: (session.user as any).workspaceId },
    include: {
      contact: true,
      company: true,
      stage: true,
      activities: { orderBy: { createdAt: "desc" }, include: { createdBy: { select: { name: true } } } },
    },
  })

  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(deal)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await req.json()
  
  // Handle won/lost
  const updateData: any = { ...data }
  if (data.stageId) {
    const stage = await prisma.pipelineStage.findUnique({ where: { id: data.stageId } })
    if (stage?.name === "Won") updateData.wonAt = new Date()
    if (stage?.name === "Lost") updateData.lostAt = new Date()
    if (stage?.name === "Won" || stage?.name === "Lost") updateData.closedAt = new Date()
  }

  await prisma.deal.updateMany({
    where: { id: params.id, workspaceId: (session.user as any).workspaceId },
    data: updateData,
  })

  const updated = await prisma.deal.findUnique({
    where: { id: params.id },
    include: { contact: true, company: true, stage: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.activity.deleteMany({ where: { dealId: params.id } })
  await prisma.deal.deleteMany({
    where: { id: params.id, workspaceId: (session.user as any).workspaceId },
  })

  return NextResponse.json({ success: true })
}
