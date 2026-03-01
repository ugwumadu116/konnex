import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const stages = await prisma.pipelineStage.findMany({
    where: { workspaceId: (session.user as any).workspaceId },
    include: {
      deals: {
        include: { contact: true, company: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { order: "asc" },
  })

  return NextResponse.json(stages)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await req.json()
  const deal = await prisma.deal.create({
    data: {
      title: data.title,
      value: data.value || 0,
      currency: data.currency || "USD",
      stageId: data.stageId,
      contactId: data.contactId || null,
      companyId: data.companyId || null,
      workspaceId: (session.user as any).workspaceId,
      createdById: (session.user as any).id,
    },
    include: { contact: true, company: true, stage: true },
  })

  return NextResponse.json(deal, { status: 201 })
}
