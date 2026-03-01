"use client"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getInitials } from "@/lib/utils"
import { Plus, Search, Mail, Phone, Building2, Trash2, Pencil } from "lucide-react"
import Link from "next/link"

interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  city?: string
  country?: string
  notes?: string
  companyId?: string
  company?: { id: string; name: string }
}

interface Company {
  id: string
  name: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", city: "", country: "", notes: "", companyId: "",
  })

  const fetchContacts = useCallback(() => {
    fetch(`/api/contacts?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then(setContacts)
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => {
    fetchContacts()
    fetch("/api/companies").then((r) => r.json()).then(setCompanies)
  }, [fetchContacts])

  const openCreate = () => {
    setEditing(null)
    setForm({ firstName: "", lastName: "", email: "", phone: "", city: "", country: "", notes: "", companyId: "" })
    setShowDialog(true)
  }

  const openEdit = (c: Contact) => {
    setEditing(c)
    setForm({
      firstName: c.firstName, lastName: c.lastName, email: c.email || "",
      phone: c.phone || "", city: c.city || "", country: c.country || "",
      notes: c.notes || "", companyId: c.companyId || "",
    })
    setShowDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, companyId: form.companyId || null }
    
    if (editing) {
      await fetch(`/api/contacts/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }
    setShowDialog(false)
    fetchContacts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact?")) return
    await fetch(`/api/contacts/${id}`, { method: "DELETE" })
    fetchContacts()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">{contacts.length} contacts</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add Contact
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : contacts.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No contacts yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first contact</p>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Contact
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {contacts.map((c) => (
            <Card key={c.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0">
                  {getInitials(`${c.firstName} ${c.lastName}`)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/contacts/${c.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                    {c.firstName} {c.lastName}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                    {c.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {c.email}
                      </span>
                    )}
                    {c.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {c.phone}
                      </span>
                    )}
                    {c.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {c.company.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-gray-100">
                    <Pencil className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editing ? "Edit Contact" : "New Contact"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
              <option value="">No company</option>
              {companies.map((co) => (
                <option key={co.id} value={co.id}>{co.name}</option>
              ))}
            </Select>
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

function Users(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
