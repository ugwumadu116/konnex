"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency, formatDate, getInitials } from "@/lib/utils"
import { ArrowLeft, DollarSign, User, Building2, Calendar, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

const activityTypes = ["CALL", "EMAIL", "MEETING", "NOTE", "TASK"]
const activityIcons: Record<string, string> = { CALL: "📞", EMAIL: "📧", MEETING: "🤝", NOTE: "📝", TASK: "✅" }

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [deal, setDeal] = useState<any>(null)
  const [showActivity, setShowActivity] = useState(false)
  const [actForm, setActForm] = useState({ type: "NOTE", title: "", description: "" })

  const fetchDeal = () => {
    fetch(`/api/deals/${params.id}`).then((r) => r.json()).then(setDeal)
  }

  useEffect(() => { fetchDeal() }, [params.id])

  const addActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...actForm, dealId: params.id }),
    })
    setShowActivity(false)
    setActForm({ type: "NOTE", title: "", description: "" })
    fetchDeal()
  }

  const deleteDeal = async () => {
    if (!confirm("Delete this deal?")) return
    await fetch(`/api/deals/${params.id}`, { method: "DELETE" })
    router.push("/deals")
  }

  if (!deal) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <Button variant="destructive" size="sm" onClick={deleteDeal}><Trash2 className="w-4 h-4" /> Delete</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{deal.title}</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Value</span>
                  <span className="text-lg font-bold">{formatCurrency(deal.value, deal.currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Stage</span>
                  <Badge style={{ backgroundColor: deal.stage?.color + "20", color: deal.stage?.color }}>
                    {deal.stage?.name}
                  </Badge>
                </div>
                {deal.contact && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Contact</span>
                    <Link href={`/contacts/${deal.contact.id}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      <User className="w-3 h-3" /> {deal.contact.firstName} {deal.contact.lastName}
                    </Link>
                  </div>
                )}
                {deal.company && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Company</span>
                    <Link href={`/companies/${deal.company.id}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {deal.company.name}
                    </Link>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm text-gray-700">{formatDate(deal.createdAt)}</span>
                </div>
                {deal.wonAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Won</span>
                    <span className="text-sm text-green-600 font-medium">{formatDate(deal.wonAt)}</span>
                  </div>
                )}
                {deal.lostAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Lost</span>
                    <span className="text-sm text-red-600 font-medium">{formatDate(deal.lostAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Timeline</CardTitle>
                <Button size="sm" onClick={() => setShowActivity(true)}><Plus className="w-4 h-4" /> Add</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {deal.activities?.length === 0 ? (
                <p className="text-gray-500 text-sm px-6 py-8 text-center">No activities yet</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {deal.activities?.map((act: any) => (
                    <div key={act.id} className="px-6 py-3 flex items-start gap-3">
                      <span className="text-lg mt-0.5">{activityIcons[act.type] || "📌"}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{act.title}</span>
                          <Badge variant="secondary">{act.type}</Badge>
                        </div>
                        {act.description && <p className="text-sm text-gray-500 mt-1">{act.description}</p>}
                        <p className="text-xs text-gray-400 mt-1">{act.createdBy?.name} · {formatDate(act.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showActivity} onClose={() => setShowActivity(false)} title="Log Activity">
        <form onSubmit={addActivity} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <Select value={actForm.type} onChange={(e) => setActForm({ ...actForm, type: e.target.value })}>
              {activityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <Input value={actForm.title} onChange={(e) => setActForm({ ...actForm, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea value={actForm.description} onChange={(e) => setActForm({ ...actForm, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowActivity(false)}>Cancel</Button>
            <Button type="submit">Log Activity</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
