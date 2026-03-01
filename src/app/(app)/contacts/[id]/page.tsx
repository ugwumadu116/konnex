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
import { ArrowLeft, Mail, Phone, MapPin, Building2, Plus } from "lucide-react"
import Link from "next/link"

const activityTypes = ["CALL", "EMAIL", "MEETING", "NOTE", "TASK"]
const activityIcons: Record<string, string> = { CALL: "📞", EMAIL: "📧", MEETING: "🤝", NOTE: "📝", TASK: "✅" }

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contact, setContact] = useState<any>(null)
  const [showActivity, setShowActivity] = useState(false)
  const [actForm, setActForm] = useState({ type: "NOTE", title: "", description: "" })

  useEffect(() => {
    fetch(`/api/contacts/${params.id}`).then((r) => r.json()).then(setContact)
  }, [params.id])

  const addActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...actForm, contactId: params.id }),
    })
    setShowActivity(false)
    setActForm({ type: "NOTE", title: "", description: "" })
    fetch(`/api/contacts/${params.id}`).then((r) => r.json()).then(setContact)
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold mx-auto mb-3">
                {getInitials(`${contact.firstName} ${contact.lastName}`)}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{contact.firstName} {contact.lastName}</h2>
              {contact.company && (
                <Link href={`/companies/${contact.company.id}`} className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1 mt-1">
                  <Building2 className="w-3 h-3" /> {contact.company.name}
                </Link>
              )}
              <div className="mt-4 space-y-2 text-sm text-left">
                {contact.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" /> {contact.email}
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" /> {contact.phone}
                  </div>
                )}
                {(contact.city || contact.country) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" /> {[contact.city, contact.country].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>
              {contact.notes && (
                <p className="mt-4 text-sm text-gray-500 text-left border-t pt-3">{contact.notes}</p>
              )}
            </CardContent>
          </Card>

          {contact.deals?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Deals</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {contact.deals.map((deal: any) => (
                    <Link key={deal.id} href={`/deals/${deal.id}`} className="block px-6 py-3 hover:bg-gray-50">
                      <p className="text-sm font-medium">{deal.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge style={{ backgroundColor: deal.stage.color + "20", color: deal.stage.color }}>
                          {deal.stage.name}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatCurrency(deal.value)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Timeline</CardTitle>
                <Button size="sm" onClick={() => setShowActivity(true)}>
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {contact.activities?.length === 0 ? (
                <p className="text-gray-500 text-sm px-6 py-8 text-center">No activities yet</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {contact.activities?.map((act: any) => (
                    <div key={act.id} className="px-6 py-3 flex items-start gap-3">
                      <span className="text-lg mt-0.5">{activityIcons[act.type] || "📌"}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{act.title}</span>
                          <Badge variant="secondary">{act.type}</Badge>
                        </div>
                        {act.description && <p className="text-sm text-gray-500 mt-1">{act.description}</p>}
                        <p className="text-xs text-gray-400 mt-1">{formatDate(act.createdAt)}</p>
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
