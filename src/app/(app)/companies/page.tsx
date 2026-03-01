"use client"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Building2, Users, Kanban, Trash2, Pencil } from "lucide-react"
import Link from "next/link"

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: "", industry: "", website: "", email: "", phone: "", address: "", city: "", country: "", notes: "",
  })

  const fetchCompanies = useCallback(() => {
    fetch(`/api/companies?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then(setCompanies)
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => { fetchCompanies() }, [fetchCompanies])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", industry: "", website: "", email: "", phone: "", address: "", city: "", country: "", notes: "" })
    setShowDialog(true)
  }

  const openEdit = (c: any) => {
    setEditing(c)
    setForm({
      name: c.name, industry: c.industry || "", website: c.website || "", email: c.email || "",
      phone: c.phone || "", address: c.address || "", city: c.city || "", country: c.country || "", notes: c.notes || "",
    })
    setShowDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await fetch(`/api/companies/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    } else {
      await fetch("/api/companies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    }
    setShowDialog(false)
    fetchCompanies()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this company?")) return
    await fetch(`/api/companies/${id}`, { method: "DELETE" })
    fetchCompanies()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 mt-1">{companies.length} companies</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Company</Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No companies yet</h3>
          <p className="text-gray-500 mb-4">Add your first company to get started</p>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Company</Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {companies.map((c) => (
            <Card key={c.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 text-sm font-bold flex-shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/companies/${c.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                    {c.name}
                  </Link>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    {c.industry && <span>{c.industry}</span>}
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c._count?.contacts || 0} contacts</span>
                    <span className="flex items-center gap-1"><Kanban className="w-3 h-3" /> {c._count?.deals || 0} deals</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-400" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editing ? "Edit Company" : "New Company"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button type="submit">{editing ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
