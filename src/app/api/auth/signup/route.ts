import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    const { name, email, password, workspaceName } = await req.json()

    if (!name || !email || !password || !workspaceName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    let slug = slugify(workspaceName)
    
    // Ensure unique slug
    const existingSlug = await prisma.workspace.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug,
        stages: {
          create: [
            { name: "Lead", order: 0, color: "#6B7280" },
            { name: "Contacted", order: 1, color: "#3B82F6" },
            { name: "Proposal", order: 2, color: "#F59E0B" },
            { name: "Negotiation", order: 3, color: "#8B5CF6" },
            { name: "Won", order: 4, color: "#10B981" },
            { name: "Lost", order: 5, color: "#EF4444" },
          ],
        },
      },
    })

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin",
        workspaceId: workspace.id,
      },
    })

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
