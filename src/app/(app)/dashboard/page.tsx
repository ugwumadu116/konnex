"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Users, Building2, Kanban, DollarSign, Trophy, Activity, TrendingUp } from "lucide-react"

interface DashboardData {
  totalContacts: number
  totalCompanies: number
  totalDeals: number
  wonDeals: number
  wonValue: number
  lostDeals: number
  totalActivities: number
  pipelineValue: number
  recentDeals: any[]
  recentActivities: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const stats = [
    { label: "Pipeline Value", value: formatCurrency(data.pipelineValue), icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
    { label: "Deals Won", value: `${data.wonDeals} (${formatCurrency(data.wonValue)})`, icon: Trophy, color: "text-green-600 bg-green-50" },
    { label: "Total Contacts", value: data.totalContacts, icon: Users, color: "text-purple-600 bg-purple-50" },
    { label: "Companies", value: data.totalCompanies, icon: Building2, color: "text-orange-600 bg-orange-50" },
    { label: "Open Deals", value: data.totalDeals - data.wonDeals - data.lostDeals, icon: Kanban, color: "text-indigo-600 bg-indigo-50" },
    { label: "Activities", value: data.totalActivities, icon: Activity, color: "text-pink-600 bg-pink-50" },
  ]

  const activityIcons: Record<string, string> = {
    CALL: "📞",
    EMAIL: "📧",
    MEETING: "🤝",
    NOTE: "📝",
    TASK: "✅",
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your sales overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Deals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentDeals.length === 0 ? (
              <p className="text-gray-500 text-sm px-6 py-4">No deals yet. Create your first deal!</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.recentDeals.map((deal: any) => (
                  <div key={deal.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                      <p className="text-xs text-gray-500">
                        {deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : "No contact"} · {formatDate(deal.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(deal.value, deal.currency)}</p>
                      <Badge style={{ backgroundColor: deal.stage.color + "20", color: deal.stage.color }}>
                        {deal.stage.name}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentActivities.length === 0 ? (
              <p className="text-gray-500 text-sm px-6 py-4">No activities yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.recentActivities.map((act: any) => (
                  <div key={act.id} className="px-6 py-3 flex items-start gap-3">
                    <span className="text-lg mt-0.5">{activityIcons[act.type] || "📌"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{act.title}</p>
                      <p className="text-xs text-gray-500">
                        {act.createdBy?.name} · {act.contact ? `${act.contact.firstName} ${act.contact.lastName}` : ""} · {formatDate(act.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
