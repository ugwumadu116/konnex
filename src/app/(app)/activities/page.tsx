"use client"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import { Plus, Activity } from "lucide-react"
import Link from "next/link"

const activityTypes = ["CALL", "EMAIL", "MEETING", "NOTE", "TASK"]
const activityIcons: Record<string, string> = { CALL: "📞", EMAIL: "📧", MEETING: "🤝", NOTE: "📝", TASK: "✅" }

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ type: "NOTE", title: "", description: "", contactId: "", dealId: "" })

  const fetchActivities = () => {
    fetch("/api/activities?limit=100").then((r) => r.json()).then(setActivities).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchActivities()
    fetch("/api/contacts").then((r) => r.json()).then(setContacts)
    // Fetch flat deals list
    fetch("/api/deals").then((r) => r.json()).then((stages: any[]) => {
      const allDeals = stages.flatMap((s: any) => s.deals.map((d: any) => ({ ...d, stageName: s.name })))
      setDeals(allDeals)
    })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, contactId: form.contactId || null, dealId: form.dealId || null }),
    })
    setShowDialog(false)
    setForm({ type: "NOTE", title: "", description: "", contactId: "", dealId: "" })
    fetchActivities()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-500 mt-1">{activities.length} activities</p>
        </div>
        <Button onClick={() => setShowDialog(true)}><Plus className="w-4 h-4" /> Log Activity</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : activities.length === 0 ? (
        <Card className="p-12 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No activities yet</h3>
          <p className="text-gray-500 mb-4">Start logging calls, emails, and meetings</p>
          <Button onClick={() => setShowDialog(true)}><Plus className="w-4 h-4" /> Log Activity</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {activities.map((act) => (
            <Card key={act.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{activityIcons[act.type] || "📌"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{act.title}</span>
                    <Badge variant="secondary">{act.type}</Badge>
                  </div>
                  {act.description && <p className="text-sm text-gray-500 mt-1">{act.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{act.createdBy?.name}</span>
                    {act.contact && (
                      <Link href={`/contacts/${act.contactId}`} className="text-blue-500 hover:underline">
                        {act.contact.firstName} {act.contact.lastName}
                      </Link>
                    )}
                    {act.deal && (
                      <Link href={`/deals/${act.dealId}`} className="text-blue-500 hover:underline">
                        {act.deal.title}
                      </Link>
                    )}
                    <span>{formatDate(act.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Log Activity">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {activityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <Select value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })}>
              <option value="">None</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deal</label>
            <Select value={form.dealId} onChange={(e) => setForm({ ...form, dealId: e.target.value })}>
              <option value="">None</option>
              {deals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button type="submit">Log Activity</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
