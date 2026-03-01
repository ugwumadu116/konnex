"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, getInitials } from "@/lib/utils"
import { ArrowLeft, Globe, Mail, Phone, MapPin, Users, Kanban } from "lucide-react"
import Link from "next/link"

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/companies/${params.id}`).then((r) => r.json()).then(setCompany)
  }, [params.id])

  if (!company) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="w-16 h-16 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 text-2xl font-bold mx-auto mb-3">
                {company.name[0]}
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center">{company.name}</h2>
              {company.industry && <p className="text-sm text-gray-500 text-center mt-1">{company.industry}</p>}
              <div className="mt-4 space-y-2 text-sm">
                {company.website && <div className="flex items-center gap-2 text-gray-600"><Globe className="w-4 h-4" /> <a href={company.website} target="_blank" className="text-blue-600 hover:underline">{company.website}</a></div>}
                {company.email && <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" /> {company.email}</div>}
                {company.phone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" /> {company.phone}</div>}
                {(company.city || company.country) && <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" /> {[company.city, company.country].filter(Boolean).join(", ")}</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Contacts ({company.contacts?.length || 0})</CardTitle></CardHeader>
            <CardContent className="p-0">
              {company.contacts?.length === 0 ? (
                <p className="text-gray-500 text-sm px-6 py-4">No contacts linked</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {company.contacts?.map((c: any) => (
                    <Link key={c.id} href={`/contacts/${c.id}`} className="block px-6 py-3 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                          {getInitials(`${c.firstName} ${c.lastName}`)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-gray-500">{c.email}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Kanban className="w-5 h-5" /> Deals ({company.deals?.length || 0})</CardTitle></CardHeader>
            <CardContent className="p-0">
              {company.deals?.length === 0 ? (
                <p className="text-gray-500 text-sm px-6 py-4">No deals yet</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {company.deals?.map((deal: any) => (
                    <Link key={deal.id} href={`/deals/${deal.id}`} className="block px-6 py-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{deal.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge style={{ backgroundColor: deal.stage?.color + "20", color: deal.stage?.color }}>{deal.stage?.name}</Badge>
                          <span className="text-sm font-semibold">{formatCurrency(deal.value)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
