"use client"
import { useEffect, useState, useCallback } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { Plus, DollarSign, User } from "lucide-react"
import Link from "next/link"

interface Deal {
  id: string
  title: string
  value: number
  currency: string
  contact?: { firstName: string; lastName: string }
  company?: { name: string }
}

interface Stage {
  id: string
  name: string
  color: string
  order: number
  deals: Deal[]
}

export default function DealsPage() {
  const [stages, setStages] = useState<Stage[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: "", value: "", currency: "USD", stageId: "", contactId: "", companyId: "" })

  const fetchDeals = useCallback(() => {
    fetch("/api/deals").then((r) => r.json()).then((data) => {
      setStages(data)
      if (data.length > 0 && !form.stageId) {
        setForm((f) => ({ ...f, stageId: data[0].id }))
      }
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchDeals()
    fetch("/api/contacts").then((r) => r.json()).then(setContacts)
    fetch("/api/companies").then((r) => r.json()).then(setCompanies)
  }, [fetchDeals])

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const sourceStageId = result.source.droppableId
    const destStageId = result.destination.droppableId
    const dealId = result.draggableId

    // Optimistically update UI
    setStages((prev) => {
      const next = prev.map((s) => ({ ...s, deals: [...s.deals] }))
      const sourceStage = next.find((s) => s.id === sourceStageId)!
      const destStage = next.find((s) => s.id === destStageId)!
      const [movedDeal] = sourceStage.deals.splice(result.source.index, 1)
      destStage.deals.splice(result.destination!.index, 0, movedDeal)
      return next
    })

    // Persist
    await fetch(`/api/deals/${dealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageId: destStageId }),
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        value: parseFloat(form.value) || 0,
        contactId: form.contactId || null,
        companyId: form.companyId || null,
      }),
    })
    setShowDialog(false)
    setForm({ title: "", value: "", currency: "USD", stageId: stages[0]?.id || "", contactId: "", companyId: "" })
    fetchDeals()
  }

  const totalPipeline = stages.reduce((sum, s) => sum + s.deals.reduce((ds, d) => ds + d.value, 0), 0)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
          <p className="text-gray-500 mt-1">
            Total pipeline: <span className="font-semibold text-gray-900">{formatCurrency(totalPipeline)}</span>
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}><Plus className="w-4 h-4" /> New Deal</Button>
      </div>

      <div className="overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 min-w-max">
            {stages.map((stage) => {
              const stageValue = stage.deals.reduce((s, d) => s + d.value, 0)
              return (
                <div key={stage.id} className="w-72 flex-shrink-0">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                      <h3 className="text-sm font-semibold text-gray-700">{stage.name}</h3>
                      <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{stage.deals.length}</span>
                    </div>
                    <span className="text-xs text-gray-500">{formatCurrency(stageValue)}</span>
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] space-y-2 rounded-xl p-2 transition-colors ${
                          snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-100/50"
                        }`}
                      >
                        {stage.deals.map((deal, index) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                                  snapshot.isDragging ? "shadow-lg ring-2 ring-blue-200" : ""
                                }`}
                              >
                                <Link href={`/deals/${deal.id}`} className="block">
                                  <p className="text-sm font-medium text-gray-900 mb-1">{deal.title}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      {deal.contact && (
                                        <span className="flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          {deal.contact.firstName} {deal.contact.lastName}
                                        </span>
                                      )}
                                      {!deal.contact && deal.company && (
                                        <span>{deal.company.name}</span>
                                      )}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-0.5">
                                      <DollarSign className="w-3 h-3" />
                                      {formatCurrency(deal.value, deal.currency).replace(/[^0-9,.KM]/g, "")}
                                    </span>
                                  </div>
                                </Link>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="New Deal">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Website redesign" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option value="USD">USD</option>
                <option value="NGN">NGN</option>
                <option value="GHS">GHS</option>
                <option value="KES">KES</option>
                <option value="ZAR">ZAR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <Select value={form.stageId} onChange={(e) => setForm({ ...form, stageId: e.target.value })}>
              {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <Select value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })}>
              <option value="">None</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
              <option value="">None</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button type="submit">Create Deal</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
