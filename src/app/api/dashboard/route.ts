import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const wid = (session.user as any).workspaceId

  const [totalContacts, totalCompanies, totalDeals, wonDeals, lostDeals, activities, pipelineValue, recentDeals, recentActivities] = await Promise.all([
    prisma.contact.count({ where: { workspaceId: wid } }),
    prisma.company.count({ where: { workspaceId: wid } }),
    prisma.deal.count({ where: { workspaceId: wid } }),
    prisma.deal.findMany({ where: { workspaceId: wid, wonAt: { not: null } } }),
    prisma.deal.count({ where: { workspaceId: wid, lostAt: { not: null } } }),
    prisma.activity.count({ where: { workspaceId: wid } }),
    prisma.deal.aggregate({ where: { workspaceId: wid, closedAt: null }, _sum: { value: true } }),
    prisma.deal.findMany({
      where: { workspaceId: wid },
      include: { stage: true, contact: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.activity.findMany({
      where: { workspaceId: wid },
      include: { contact: { select: { firstName: true, lastName: true } }, createdBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0)

  return NextResponse.json({
    totalContacts,
    totalCompanies,
    totalDeals,
    wonDeals: wonDeals.length,
    wonValue,
    lostDeals,
    totalActivities: activities,
    pipelineValue: pipelineValue._sum.value || 0,
    recentDeals,
    recentActivities,
  })
}
