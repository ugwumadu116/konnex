import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const contactId = searchParams.get("contactId")
  const dealId = searchParams.get("dealId")
  const companyId = searchParams.get("companyId")
  const limit = parseInt(searchParams.get("limit") || "50")

  const activities = await prisma.activity.findMany({
    where: {
      workspaceId: (session.user as any).workspaceId,
      ...(contactId && { contactId }),
      ...(dealId && { dealId }),
      ...(companyId && { companyId }),
    },
    include: {
      contact: { select: { firstName: true, lastName: true } },
      deal: { select: { title: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return NextResponse.json(activities)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await req.json()
  const activity = await prisma.activity.create({
    data: {
      type: data.type,
      title: data.title,
      description: data.description || null,
      contactId: data.contactId || null,
      dealId: data.dealId || null,
      companyId: data.companyId || null,
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
      workspaceId: (session.user as any).workspaceId,
      createdById: (session.user as any).id,
    },
    include: {
      contact: { select: { firstName: true, lastName: true } },
      deal: { select: { title: true } },
      createdBy: { select: { name: true } },
    },
  })

  return NextResponse.json(activity, { status: 201 })
}
