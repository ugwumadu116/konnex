"use client"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your workspace</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Name</span>
              <span className="text-sm font-medium">{session?.user?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium">{session?.user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Role</span>
              <Badge>{session?.user?.role}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Workspace</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Workspace</span>
              <span className="text-sm font-medium">{session?.user?.workspaceName}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>About Konnex</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Konnex CRM v1.0 — Simple, powerful CRM built for African businesses.
              <br />Part of the <a href="https://rivrafrica.com" className="text-blue-600 hover:underline" target="_blank">RivrAfrica</a> suite.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
